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
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Register event handlers
    registerUserEvents(socket, io);
    registerMessageEvents(socket, io);
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
    
    // Get receiver's socket ID if they're online
    const receiverSocketId = userConnections[receiverId];

    // Send to receiver if they're online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        senderId,
        conversationId,
        message,
        timestamp,
        status
      });
    } else {
      console.log(`Receiver ${receiverId} is not currently connected`);
    }
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