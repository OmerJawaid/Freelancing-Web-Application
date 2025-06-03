// sockets.js - WebSocket configuration for real-time messaging and order updates
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
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 10000,
    cookie: false
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Register event handlers
    registerUserEvents(socket, io);
    registerMessageEvents(socket, io);
    registerOrderEvents(socket, io);
    registerDisconnectEvents(socket, io);
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
    
    // Associate userId with socket ID in both local and global storage
    userConnections[userId] = socket.id;
    global.users[userId] = socket.id; // This is critical for notifications
    
    // Join both a user-specific room and a general room
    socket.join(`user_${userId}`);
    socket.join('all_users');
    
    // Mark user as online
    onlineUsers.add(userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);
    
    // Notify all clients about the user going online
    io.to('all_users').emit('user_status_change', { userId, status: 'online' });
    
    // Send confirmation back to the user
    socket.emit('join_confirmed', { userId, socketId: socket.id });
    
    // Send current online users to the newly joined user
    socket.emit('online_users', Array.from(onlineUsers));
    
    // Log active rooms for this socket
    const rooms = Array.from(socket.rooms);
    console.log(`Socket ${socket.id} is in rooms:`, rooms);
  });
  
  // User joins a conversation room
  socket.on('join_conversation', (data) => {
    const { conversationId } = data;
    
    if (!conversationId) {
      console.warn('Join conversation attempt without conversationId');
      return;
    }
    
    // Join the conversation room
    const roomName = `conversation_${conversationId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined conversation room: ${roomName}`);
    
    // Send confirmation back to the user
    socket.emit('conversation_joined', { conversationId, roomName });
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
    const { senderId, receiverId, message, conversationId, timestamp, status, type, attachmentUrl } = data;
    
    if (!senderId || !receiverId || !conversationId) {
      console.warn('Invalid message data received:', data);
      return;
    }
    
    console.log(`Message from ${senderId} to ${receiverId} in conversation ${conversationId}`);
    
    // Get receiver's socket ID if they're online
    const receiverSocketId = userConnections[receiverId];

    // Create message payload with all necessary data
    const messagePayload = {
      senderId,
      receiverId,
      conversationId,
      message,
      timestamp: timestamp || new Date().toISOString(),
      status: status || 'sent',
      type: type || 'text',
      attachmentUrl,
      lastMessagePreview: message
    };
    
    // Always broadcast to the conversation room first (most reliable method)
    const conversationRoom = `conversation_${conversationId}`;
    io.to(conversationRoom).emit('receive_message', messagePayload);
    console.log(`Message broadcast to conversation room: ${conversationRoom}`);
    
    // Send to receiver using multiple delivery methods for reliability
    if (receiverSocketId) {
      console.log(`Sending message to receiver socket ${receiverSocketId}`);
      
      // Method 1: Direct to socket ID
      io.to(receiverSocketId).emit('receive_message', messagePayload);
      
      // Method 2: To user's room
      io.to(`user_${receiverId}`).emit('receive_message', messagePayload);
      
      // Log delivery attempt
      console.log(`Message delivered to ${receiverId} via socket ${receiverSocketId}`);
    } else {
      console.log(`Receiver ${receiverId} is not currently connected`);
      // Still try the user room in case they reconnected with a different socket
      io.to(`user_${receiverId}`).emit('receive_message', messagePayload);
    }
    
    // Also send back to sender for confirmation and multi-device sync
    socket.emit('receive_message', {
      ...messagePayload,
      status: 'delivered'
    });
    
    // Send to sender's room for multi-device sync
    io.to(`user_${senderId}`).emit('receive_message', messagePayload);
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
      delete global.users[userId]; // Clean up global reference for notifications
      
      // Notify all clients about user going offline
      io.to('all_users').emit('user_status_change', { userId, status: 'offline' });
      console.log(`User ${userId} disconnected`);
    }
    
    console.log('Socket disconnected:', socket.id);
  });
  
  // Handle explicit disconnection request
  socket.on('logout', () => {
    const userId = findUserBySocketId(socket.id);
    
    if (userId) {
      console.log(`User ${userId} logging out`);
      onlineUsers.delete(userId);
      delete userConnections[userId];
      
      // Notify all clients
      io.to('all_users').emit('user_status_change', { userId, status: 'offline' });
    }
  });
}

/**
 * Register order-related socket events
 * @param {Object} socket - Socket instance
 * @param {Object} io - Socket.IO server instance
 */
function registerOrderEvents(socket, io) {
  // Join order-specific room when client wants to listen for updates
  socket.on('join_order_updates', (data) => {
    const { userId } = data;
    
    if (!userId) {
      console.warn('Join order updates attempt without userId');
      return;
    }
    
    // Join a user-specific order updates room
    socket.join(`order_updates_${userId}`);
    console.log(`User ${userId} joined order updates room with socket ${socket.id}`);
    
    // Send confirmation back to the user
    socket.emit('order_updates_joined', { userId });
  });

  // Handle order status updates from connected clients
  socket.on('order_status_updated', (data) => {
    const { orderId, status, userId, freelancerId } = data;
    
    if (!orderId || !status) {
      console.warn('Invalid order status update data:', data);
      return;
    }
    
    console.log(`Order ${orderId} status updated to ${status}`);
    
    // Broadcast to client's order updates room
    if (userId) {
      io.to(`order_updates_${userId}`).emit('order_status_change', { orderId, status });
      console.log(`Order update sent to client ${userId}`);
    }
    
    // Broadcast to freelancer's order updates room
    if (freelancerId) {
      io.to(`order_updates_${freelancerId}`).emit('order_status_change', { orderId, status });
      console.log(`Order update sent to freelancer ${freelancerId}`);
    }
  });
  
  // Handle order status updates triggered by server code
  // For direct server event emissions (non-socket events)
  io.on('order_status_updated', (data) => {
    const { orderId, status, userId, freelancerId } = data;
    
    if (!orderId || !status) {
      console.warn('Invalid direct order status update data:', data);
      return;
    }
    
    console.log(`[Direct] Order ${orderId} status updated to ${status}`);
    
    // Broadcast to client's order updates room
    if (userId) {
      io.to(`order_updates_${userId}`).emit('order_status_change', { orderId, status });
      console.log(`[Direct] Order update sent to client ${userId}`);
    }
    
    // Broadcast to freelancer's order updates room
    if (freelancerId) {
      io.to(`order_updates_${freelancerId}`).emit('order_status_change', { orderId, status });
      console.log(`[Direct] Order update sent to freelancer ${freelancerId}`);
    }
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