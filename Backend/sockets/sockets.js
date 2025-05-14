import {Server}from 'socket.io'
const users = {};
const onlineUsers = new Set();

function configureSocket(server){
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // React Vite app URL
      methods: ['GET', 'POST'],
    }
});

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join user to their own room for receiving messages
    socket.on('join', (data) => {
        const { userId } = data;
        users[userId] = socket.id;
        socket.join(`user_${userId}`);
        
        // Mark user as online
        onlineUsers.add(userId);
        console.log(`User ${userId} joined with socket ${socket.id}`);
        
        
        io.emit('user_status_change', { userId, status: 'online' });
    });
    
    // User requests current online users
    socket.on('get_online_users', () => {
        socket.emit('online_users', Array.from(onlineUsers));
    });
  
    //Sending messages from user
    socket.on('send_message', (data) => {
        const { senderId, receiverId, message, conversationId, timestamp, status } = data;
        console.log('Message received from socket:', data);
        
        const receiverSocketId = users[receiverId];

        // Send to receiver if online
        if (receiverSocketId) {
            console.log(`Sending message to receiver ${receiverId} with socket ${receiverSocketId}`);
            io.to(receiverSocketId).emit('receive_message', {
                senderId,
                conversationId,
                message,
                timestamp,
                status
            });
        } else {
            console.log(`Receiver ${receiverId} is not connected`);
        }
        
    });
  
    //Disconnection of User
    socket.on('disconnect', () => {
        // Remove from `users` object
        for (const [userId, sockId] of Object.entries(users)) {
            if (sockId === socket.id) {
                // Mark user as offline
                onlineUsers.delete(userId);
                delete users[userId];
                
                // Notify all clients about the user going offline
                io.emit('user_status_change', { userId, status: 'offline' });
                
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
        console.log('Socket disconnected:', socket.id);
    });
    
    // Handle explicit user status changes (away)
    socket.on('set_user_status', ({ userId, status }) => {
        // Broadcast user's status change to all clients
        io.emit('user_status_change', { userId, status });
        console.log(`User ${userId} changed status to ${status}`);
    });
});
return io;
}

export default configureSocket;