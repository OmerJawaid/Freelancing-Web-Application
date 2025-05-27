// sockets.js - WebSocket configuration for real-time messaging
import { Server } from 'socket.io';

// Store active user connections and online status
const userConnections = {};
const onlineUsers = new Set();

/**
 * Configure and initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
function configureSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    // Ensure reliable connections with proper transport options
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e8 // 100MB for file transfers
  });

  // Store io instance globally for notification system
  global.io = io;
  global.users = userConnections;

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Register event handlers
    registerUserEvents(socket, io);
    registerMessageEvents(socket, io);
    registerNotificationEvents(socket, io);
    registerDisconnectEvents(socket, io);
    
    // Send immediate confirmation to client
    socket.emit('connection_established', { socketId: socket.id });
  });

  return io;
}

/**
 * Register user-related socket events
 * @param {Object} socket - Socket instance
 * @param {Object} io - Socket.IO server instance
 */
function registerUserEvents(socket, io) {
  // User joins the socket
  socket.on('join', (data) => {
    const { userId } = data;
    
    if (!userId) {
      console.warn('Join attempt without userId');
      return;
    }
    
    // Associate userId with socket ID
    userConnections[userId] = socket.id;
    socket.join(`user_${userId}`);
    
    // Mark user as online
    onlineUsers.add(userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);
    
    // Notify all clients about the user going online
    io.emit('user_status_change', { userId, status: 'online' });
  });
  
  // User requests list of online users
  socket.on('get_online_users', () => {
    socket.emit('online_users', Array.from(onlineUsers));
  });
  
  // User manually changes status (away, etc.)
  socket.on('set_user_status', ({ userId, status }) => {
    if (!userId) return;
    
    // Broadcast status change to all clients
    io.emit('user_status_change', { userId, status });
    console.log(`User ${userId} changed status to ${status}`);
  });
}

/**
 * Register message-related socket events
 * @param {Object} socket - Socket instance
 * @param {Object} io - Socket.IO server instance
 */
function registerMessageEvents(socket, io) {
  // User sends a message
  socket.on('send_message', (data) => {
    const { senderId, receiverId, message, conversationId, timestamp, status } = data;
    
    if (!senderId || !receiverId || !conversationId) {
      console.warn('Invalid message data received:', data);
      return;
    }
    
    console.log(`Message from ${senderId} to ${receiverId} in conversation ${conversationId}`);
    
    // Prepare the message object with all necessary fields
    const messageObject = {
      senderId,
      conversationId,
      receiverId,
      message,
      timestamp: timestamp || new Date().toISOString(),
      status: status || 'sent',
      type: data.type || 'text',
      attachmentUrl: data.attachmentUrl,
      fileName: data.fileName,
      lastMessagePreview: data.lastMessagePreview || message
    };
    
    // Log the full message object for debugging
    console.log('Broadcasting message object:', JSON.stringify(messageObject));
    
    // Broadcast to the conversation room - this ensures all clients viewing this conversation get the message
    const roomName = `conversation_${conversationId}`;
    io.to(roomName).emit('receive_message', messageObject);
    
    // Also send directly to sender and receiver sockets as a backup
    const senderSocketId = userConnections[senderId];
    if (senderSocketId) {
      console.log(`Emitting message to sender ${senderId} via socket ${senderSocketId}`);
      io.to(senderSocketId).emit('receive_message', messageObject);
    }

    const receiverSocketId = userConnections[receiverId];
    if (receiverSocketId) {
      console.log(`Emitting message to receiver ${receiverId} via socket ${receiverSocketId}`);
      io.to(receiverSocketId).emit('receive_message', messageObject);
    } else {
      console.log(`Receiver ${receiverId} is not currently connected`);
    }
  });
  
  // User joins a conversation - add them to the conversation room
  socket.on('join_conversation', (data) => {
    const { userId, conversationId } = data;
    
    if (!userId || !conversationId) {
      console.warn('Invalid join_conversation data:', data);
      return;
    }
    
    const roomName = `conversation_${conversationId}`;
    socket.join(roomName);
    console.log(`User ${userId} joined conversation room ${roomName}`);
    
    // Notify the room that a user has joined
    socket.to(roomName).emit('user_joined_conversation', { userId, conversationId });
  });
  
  // User leaves a conversation
  socket.on('leave_conversation', (data) => {
    const { userId, conversationId } = data;
    
    if (!userId || !conversationId) return;
    
    const roomName = `conversation_${conversationId}`;
    socket.leave(roomName);
    console.log(`User ${userId} left conversation room ${roomName}`);
  });
}

/**
 * Register notification-specific socket events
 * @param {Object} socket - Socket instance
 * @param {Object} io - Socket.IO server instance
 */
function registerNotificationEvents(socket, io) {
  // User subscribes to notifications
  socket.on('subscribe_to_notifications', (userId) => {
    if (!userId) return;
    
    const roomName = `notifications_${userId}`;
    socket.join(roomName);
    console.log(`User ${userId} subscribed to notifications`);
    
    // Store the user's socket ID for direct messaging
    userConnections[userId] = socket.id;
  });

  // Handle notification acknowledgment
  socket.on('notification_received', (data) => {
    console.log('Notification acknowledged by user:', data);
  });
}

/**
 * Register disconnect events
 * @param {Object} socket - Socket instance
 * @param {Object} io - Socket.IO server instance
 */
function registerDisconnectEvents(socket, io) {
  socket.on('disconnect', () => {
    // Find which user this socket belongs to
    const userId = findUserBySocketId(socket.id);
    
    if (userId) {
      // Mark user as offline
      onlineUsers.delete(userId);
      delete userConnections[userId];
      
      // Notify all clients about user going offline
      io.emit('user_status_change', { userId, status: 'offline' });
      console.log(`User ${userId} disconnected`);
    }
    
    console.log('Socket disconnected:', socket.id);
  });
}

/**
 * Find user ID by socket ID
 * @param {string} socketId - Socket ID to search for
 * @returns {string|null} User ID if found, null otherwise
 */
function findUserBySocketId(socketId) {
  for (const [userId, sockId] of Object.entries(userConnections)) {
    if (sockId === socketId) {
      return userId;
    }
  }
  return null;
}

export default configureSocket;