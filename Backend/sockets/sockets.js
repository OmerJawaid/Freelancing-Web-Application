// sockets.js - WebSocket configuration for real-time messaging
import { Server } from 'socket.io';
import { messageEvents, MESSAGE_EVENTS } from '../events/MessageEvents.js';

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
// =======
//       methods: ['GET', 'POST'],
//       credentials: true
//     },
//     // Ensure reliable connections with proper transport options
//     transports: ['websocket', 'polling'],
//     pingTimeout: 60000,
//     pingInterval: 25000,
//     upgradeTimeout: 30000,
//     maxHttpBufferSize: 1e8 // 100MB for file transfers
// >>>>>>> Ui-Fixtures
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
  // User sends a message - using Observer pattern
  socket.on('send_message', (data) => {
    const { senderId, receiverId, message, conversationId, timestamp, status, type, attachmentUrl } = data;
    
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
      lastMessagePreview: message,
      socketId: socket.id
    };
    
//<<<<<<< HEAD
    // Using the Observer pattern - emit an event that other components can listen to
//    messageEvents.emit(MESSAGE_EVENTS.NEW_MESSAGE, messagePayload, io);
//=======
    // Send to receiver using multiple delivery methods for reliability
    if (receiverSocketId) {
      console.log(`Sending message to receiver socket ${receiverSocketId}`);
      
      // Method 1: Direct to socket ID
      io.to(receiverSocketId).emit('receive_message', messagePayload);
      
      // Method 2: To user's room
      io.to(`user_${receiverId}`).emit('receive_message', messagePayload);
      
      // Log delivery attempt
      console.log(`Message delivered to ${receiverId} via socket ${receiverSocketId}`);
// =======
//     const receiverSocketId = userConnections[receiverId];
//     if (receiverSocketId) {
//       console.log(`Emitting message to receiver ${receiverId} via socket ${receiverSocketId}`);
//       io.to(receiverSocketId).emit('receive_message', messageObject);
// >>>>>>> Ui-Fixtures
    } else {
      console.log(`Receiver ${receiverId} is not currently connected`);
    }
//>>>>>>> 847e19b470a0b19c23aaa75d9ff4158f821552a8
    
    // Join the conversation room if not already joined
    const conversationRoom = `conversation_${conversationId}`;
    if (!socket.rooms.has(conversationRoom)) {
      socket.join(conversationRoom);
    }
  });
  

  // Add a listener for message delivery
  socket.on('message_delivered', (data) => {
    messageEvents.emit(MESSAGE_EVENTS.MESSAGE_DELIVERED, {
      ...data,
      socketId: socket.id
    }, io);
  });
  
  // Add a listener for message read status
  socket.on('message_read', (data) => {
    messageEvents.emit(MESSAGE_EVENTS.MESSAGE_READ, {
      ...data,
      socketId: socket.id
    }, io);
  });
  
  // Add a listener for typing indicator
  socket.on('typing', (data) => {
    messageEvents.emit(MESSAGE_EVENTS.USER_TYPING, {
      ...data,
      socketId: socket.id
    }, io);
  });
  
  // Add a listener for stopped typing
  socket.on('stop_typing', (data) => {
    messageEvents.emit(MESSAGE_EVENTS.USER_STOP_TYPING, {
      ...data,
      socketId: socket.id
    }, io);
  });
  
  // Setup message event handlers using the Observer pattern
  setupMessageEventHandlers(io);
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

/**
 * Setup message event handlers using the Observer pattern
 * @param {Object} io - Socket.IO server instance
 */
function setupMessageEventHandlers(io) {
  // Handle new messages
  messageEvents.on(MESSAGE_EVENTS.NEW_MESSAGE, (messagePayload, io) => {
    const { senderId, receiverId, conversationId } = messagePayload;
    
    // Get receiver's socket ID if they're online
    const receiverSocketId = userConnections[receiverId];
    
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
    }
    
    // Also send back to sender for confirmation and multi-device sync
    io.to(messagePayload.socketId).emit('receive_message', {
      ...messagePayload,
      status: 'delivered'
    });
    
    // Broadcast to conversation room
    const conversationRoom = `conversation_${conversationId}`;
    io.to(conversationRoom).emit('receive_message', messagePayload);
  });
  
  // Handle message delivery status
  messageEvents.on(MESSAGE_EVENTS.MESSAGE_DELIVERED, (data, io) => {
    const { messageId, conversationId, receiverId } = data;
    
    // Notify the sender that the message was delivered
    io.to(`user_${receiverId}`).emit('message_status_update', {
      messageId,
      conversationId,
      status: 'delivered'
    });
  });
  
  // Handle message read status
  messageEvents.on(MESSAGE_EVENTS.MESSAGE_READ, (data, io) => {
    const { messageId, conversationId, senderId, receiverId } = data;
    
    // Notify the sender that the message was read
    io.to(`user_${senderId}`).emit('message_status_update', {
      messageId,
      conversationId,
      status: 'read'
    });
  });
  
  // Handle typing indicator
  messageEvents.on(MESSAGE_EVENTS.USER_TYPING, (data, io) => {
    const { userId, conversationId } = data;
    
    // Broadcast typing status to the conversation room
    io.to(`conversation_${conversationId}`).emit('typing_indicator', {
      userId,
      conversationId,
      isTyping: true
    });
  });
  
  // Handle stopped typing
  messageEvents.on(MESSAGE_EVENTS.USER_STOP_TYPING, (data, io) => {
    const { userId, conversationId } = data;
    
    // Broadcast typing status to the conversation room
    io.to(`conversation_${conversationId}`).emit('typing_indicator', {
      userId,
      conversationId,
      isTyping: false
    });
  });
}

export default configureSocket;