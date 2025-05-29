[33mcommit 13d6589ddb8bb22098d49d50c879653c236c6e6d[m
Author: Muhammad Omer Jawaid <omerjawaid0@gmail.com>
Date:   Wed May 28 03:54:56 2025 -0700

    messaging fixtures

[1mdiff --git a/Backend/controller/Messages.js b/Backend/controller/Messages.js[m
[1mindex f63f237..f9dd108 100644[m
[1m--- a/Backend/controller/Messages.js[m
[1m+++ b/Backend/controller/Messages.js[m
[36m@@ -152,7 +152,7 @@[m [mconst retrieveMessages = async (req, res) => {[m
 [m
         // Fetch messages from database[m
         const [messages] = await database_pool.query([m
[31m-            `SELECT * FROM skillify.messages [m
[32m+[m[32m            `SELECT * FROM messages[m[41m [m
              WHERE Conversation_Id = ? [m
              ORDER BY Created_at ASC;`,[m
             [conversation_id][m
[1mdiff --git a/Backend/sockets/sockets.js b/Backend/sockets/sockets.js[m
[1mindex bdd5d1e..e942485 100644[m
[1m--- a/Backend/sockets/sockets.js[m
[1m+++ b/Backend/sockets/sockets.js[m
[36m@@ -14,9 +14,14 @@[m [mfunction configureSocket(server) {[m
   const io = new Server(server, {[m
     cors: {[m
       origin: process.env.FRONTEND_URL || 'http://localhost:5173',[m
[31m-      methods: ['GET', 'POST'],[m
[31m-      credentials: true[m
[31m-    }[m
[32m+[m[32m      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],[m
[32m+[m[32m      credentials: true,[m
[32m+[m[32m      allowedHeaders: ['Content-Type', 'Authorization'][m
[32m+[m[32m    },[m
[32m+[m[32m    transports: ['websocket', 'polling'],[m
[32m+[m[32m    pingTimeout: 30000,[m
[32m+[m[32m    pingInterval: 10000,[m
[32m+[m[32m    cookie: false[m
   });[m
 [m
   // Handle socket connections[m
[36m@@ -49,14 +54,27 @@[m [mfunction registerUserEvents(socket, io) {[m
     [m
     // Associate userId with socket ID[m
     userConnections[userId] = socket.id;[m
[32m+[m[41m    [m
[32m+[m[32m    // Join both a user-specific room and a general room[m
     socket.join(`user_${userId}`);[m
[32m+[m[32m    socket.join('all_users');[m
     [m
     // Mark user as online[m
     onlineUsers.add(userId);[m
     console.log(`User ${userId} joined with socket ${socket.id}`);[m
     [m
     // Notify all clients about the user going online[m
[31m-    io.emit('user_status_change', { userId, status: 'online' });[m
[32m+[m[32m    io.to('all_users').emit('user_status_change', { userId, status: 'online' });[m
[32m+[m[41m    [m
[32m+[m[32m    // Send confirmation back to the user[m
[32m+[m[32m    socket.emit('join_confirmed', { userId, socketId: socket.id });[m
[32m+[m[41m    [m
[32m+[m[32m    // Send current online users to the newly joined user[m
[32m+[m[32m    socket.emit('online_users', Array.from(onlineUsers));[m
[32m+[m[41m    [m
[32m+[m[32m    // Log active rooms for this socket[m
[32m+[m[32m    const rooms = Array.from(socket.rooms);[m
[32m+[m[32m    console.log(`Socket ${socket.id} is in rooms:`, rooms);[m
   });[m
   [m
   // User requests list of online users[m
[36m@@ -82,7 +100,7 @@[m [mfunction registerUserEvents(socket, io) {[m
 function registerMessageEvents(socket, io) {[m
   // User sends a message[m
   socket.on('send_message', (data) => {[m
[31m-    const { senderId, receiverId, message, conversationId, timestamp, status } = data;[m
[32m+[m[32m    const { senderId, receiverId, message, conversationId, timestamp, status, type, attachmentUrl } = data;[m
     [m
     if (!senderId || !receiverId || !conversationId) {[m
       console.warn('Invalid message data received:', data);[m
[36m@@ -94,18 +112,47 @@[m [mfunction registerMessageEvents(socket, io) {[m
     // Get receiver's socket ID if they're online[m
     const receiverSocketId = userConnections[receiverId];[m
 [m
[31m-    // Send to receiver if they're online[m
[32m+[m[32m    // Create message payload with all necessary data[m
[32m+[m[32m    const messagePayload = {[m
[32m+[m[32m      senderId,[m
[32m+[m[32m      receiverId,[m
[32m+[m[32m      conversationId,[m
[32m+[m[32m      message,[m
[32m+[m[32m      timestamp: timestamp || new Date().toISOString(),[m
[32m+[m[32m      status: status || 'sent',[m
[32m+[m[32m      type: type || 'text',[m
[32m+[m[32m      attachmentUrl,[m
[32m+[m[32m      lastMessagePreview: message[m
[32m+[m[32m    };[m
[32m+[m[41m    [m
[32m+[m[32m    // Send to receiver using multiple delivery methods for reliability[m
     if (receiverSocketId) {[m
[31m-      io.to(receiverSocketId).emit('receive_message', {[m
[31m-        senderId,[m
[31m-        conversationId,[m
[31m-        message,[m
[31m-        timestamp,[m
[31m-        status[m
[31m-      });[m
[32m+[m[32m      console.log(`Sending message to receiver socket ${receiverSocketId}`);[m
[32m+[m[41m      [m
[32m+[m[32m      // Method 1: Direct to socket ID[m
[32m+[m[32m      io.to(receiverSocketId).emit('receive_message', messagePayload);[m
[32m+[m[41m      [m
[32m+[m[32m      // Method 2: To user's room[m
[32m+[m[32m      io.to(`user_${receiverId}`).emit('receive_message', messagePayload);[m
[32m+[m[41m      [m
[32m+[m[32m      // Log delivery attempt[m
[32m+[m[32m      console.log(`Message delivered to ${receiverId} via socket ${receiverSocketId}`);[m
     } else {[m
       console.log(`Receiver ${receiverId} is not currently connected`);[m
     }[m
[32m+[m[41m    [m
[32m+[m[32m    // Also send back to sender for confirmation and multi-device sync[m
[32m+[m[32m    socket.emit('receive_message', {[m
[32m+[m[32m      ...messagePayload,[m
[32m+[m[32m      status: 'delivered'[m
[32m+[m[32m    });[m
[32m+[m[41m    [m
[32m+[m[32m    // Broadcast to conversation room if it exists[m
[32m+[m[32m    const conversationRoom = `conversation_${conversationId}`;[m
[32m+[m[32m    if (io.sockets.adapter.rooms.has(conversationRoom)) {[m
[32m+[m[32m      io.to(conversationRoom).emit('receive_message', messagePayload);[m
[32m+[m[32m      console.log(`Message broadcast to conversation room: ${conversationRoom}`);[m
[32m+[m[32m    }[m
   });[m
 }[m
 [m
[36m@@ -125,12 +172,26 @@[m [mfunction registerDisconnectEvents(socket, io) {[m
       delete userConnections[userId];[m
       [m
       // Notify all clients about user going offline[m
[31m-      io.emit('user_status_change', { userId, status: 'offline' });[m
[32m+[m[32m      io.to('all_users').emit('user_status_change', { userId, status: 'offline' });[m
       console.log(`User ${userId} disconnected`);[m
     }[m
     [m
     console.log('Socket disconnected:', socket.id);[m
   });[m
[32m+[m[41m  [m
[32m+[m[32m  // Handle explicit disconnection request[m
[32m+[m[32m  socket.on('logout', () => {[m
[32m+[m[32m    const userId = findUserBySocketId(socket.id);[m
[32m+[m[41m    [m
[32m+[m[32m    if (userId) {[m
[32m+[m[32m      console.log(`User ${userId} logging out`);[m
[32m+[m[32m      onlineUsers.delete(userId);[m
[32m+[m[32m      delete userConnections[userId];[m
[32m+[m[41m      [m
[32m+[m[32m      // Notify all clients[m
[32m+[m[32m      io.to('all_users').emit('user_status_change', { userId, status: 'offline' });[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
 }[m
 [m
 /**[m
[1mdiff --git a/Frontend/src/Pages/Messages/Messages.jsx b/Frontend/src/Pages/Messages/Messages.jsx[m
[1mindex 18a48dd..70dbd09 100644[m
[1m--- a/Frontend/src/Pages/Messages/Messages.jsx[m
[1m+++ b/Frontend/src/Pages/Messages/Messages.jsx[m
[36m@@ -9,12 +9,9 @@[m [mimport { useNavigate } from 'react-router-dom';[m
 // Default avatar image[m
 const DEFAULT_AVATAR = "https://placehold.co/100/e9ecef/495057?text=User";[m
 [m
[31m-// Create socket outside component to prevent multiple connections[m
[31m-const socket = io('http://localhost:8081', { [m
[31m-  reconnection: true,[m
[31m-  reconnectionAttempts: 5,[m
[31m-  reconnectionDelay: 1000[m
[31m-});[m
[32m+[m[32m// Create socket reference to be initialized inside the component[m
[32m+[m[32m// This ensures proper cleanup and prevents memory leaks[m
[32m+[m[32mlet socket = null;[m
 [m
 // Utility function to format timestamps[m
 const formatMessageTime = (timestamp) => {[m
[36m@@ -65,6 +62,7 @@[m [mconst Messages = () => {[m
   const fileInputRef = useRef(null);[m
   const [debugInfo, setDebugInfo] = useState('');[m
   const [receivedMessages, setReceivedMessages] = useState({});[m
[32m+[m[32m  const socketRef = useRef(null); // Reference to maintain socket instance[m
 [m
   // Track user activity[m
   useEffect(() => {[m
[36m@@ -92,10 +90,14 @@[m [mconst Messages = () => {[m
         if (Date.now() - lastActivityRef.current > 300000) { // 5 minutes of inactivity[m
           setUserStatus('away');[m
           setIsActive(false);[m
[31m-          socket.emit('set_user_status', { [m
[31m-            userId: currentUser.current?.id, [m
[31m-            status: 'away' [m
[31m-          });[m
[32m+[m[41m          [m
[32m+[m[32m          // Use socketRef to ensure we're using the current socket instance[m
[32m+[m[32m          if (socketRef.current) {[m
[32m+[m[32m            socketRef.current.emit('set_user_status', {[m[41m [m
[32m+[m[32m              userId: currentUser.current?.id,[m[41m [m
[32m+[m[32m              status: 'away'[m[41m [m
[32m+[m[32m            });[m
[32m+[m[32m          }[m
         }[m
       }, 300000); // Check after 5 minutes[m
     };[m
[36m@@ -119,7 +121,7 @@[m [mconst Messages = () => {[m
     };[m
   }, [userStatus]); // Only depend on userStatus, not lastActivity[m
 [m
[31m-  // Authentication check[m
[32m+[m[32m  // Authentication check and socket setup[m
   useEffect(() => {[m
     // Get the logged-in user from localStorage[m
     const storedUser = localStorage.getItem('user');[m
[36m@@ -141,17 +143,28 @@[m [mconst Messages = () => {[m
       return;[m
     }[m
 [m
[31m-    // Setup socket connection[m
[31m-    // console.log("Setting up socket connection for user:", currentUser.current.id);[m
[32m+[m[32m    // Initialize socket connection[m
[32m+[m[32m    console.log("Setting up socket connection for user:", currentUser.current.id);[m
     [m
[31m-    socket.connect();[m
[31m-    socket.emit('join', { userId: currentUser.current.id });[m
[32m+[m[32m    // Create new socket instance[m
[32m+[m[32m    socketRef.current = io('http://localhost:8081', {[m[41m [m
[32m+[m[32m      reconnection: true,[m
[32m+[m[32m      reconnectionAttempts: 5,[m
[32m+[m[32m      reconnectionDelay: 1000,[m
[32m+[m[32m      transports: ['websocket', 'polling'],[m
[32m+[m[32m      withCredentials: true,[m
[32m+[m[32m      forceNew: true[m
[32m+[m[32m    });[m
     [m
[31m-    // Request list of online users[m
[31m-    socket.emit('get_online_users');[m
[32m+[m[32m    const socket = socketRef.current;[m
     [m
[32m+[m[32m    // Handle connection events[m
     socket.on('connect', () => {[m
[31m-      // console.log("Socket connected, ID:", socket.id);[m
[32m+[m[32m      console.log("Socket connected, ID:", socket.id);[m
[32m+[m[41m      [m
[32m+[m[32m      // Join user room and request online users after successful connection[m
[32m+[m[32m      socket.emit('join', { userId: currentUser.current.id });[m
[32m+[m[32m      socket.emit('get_online_users');[m
     });[m
     [m
     socket.on('connect_error', (error) => {[m
[36m@@ -160,7 +173,7 @@[m [mconst Messages = () => {[m
     [m
     // Listen for online users list[m
     socket.on('online_users', (users) => {[m
[31m-      // console.log("Received online users:", users);[m
[32m+[m[32m      console.log("Received online users:", users);[m
       setOnlineUsers(new Set(users));[m
     });[m
     [m
[36m@@ -212,8 +225,11 @@[m [mconst Messages = () => {[m
 [m
     // Clean up socket connection on component unmount[m
     return () => {[m
[31m-      // console.log("Disconnecting socket");[m
[31m-      socket.disconnect();[m
[32m+[m[32m      console.log("Disconnecting socket");[m
[32m+[m[32m      if (socket) {[m
[32m+[m[32m        socket.disconnect();[m
[32m+[m[32m        socketRef.current = null;[m
[32m+[m[32m      }[m
     };[m
   }, [navigate]);[m
 [m
[36m@@ -286,16 +302,45 @@[m [mconst Messages = () => {[m
 [m
   // Listen for new messages[m
   useEffect(() => {[m
[31m-    // Socket listener for receiving messages[m
[32m+[m[32m    if (!socketRef.current) {[m
[32m+[m[32m      console.error('Socket not initialized');[m
[32m+[m[32m      return;[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
[32m+[m[32m    const socket = socketRef.current;[m
[32m+[m[32m    console.log('Setting up message listener on socket:', socket.id);[m
[32m+[m[41m    [m
[32m+[m[32m    // Socket listener for receiving messages - COMPLETELY REVISED[m
     const handleReceiveMessage = (data) => {[m
[31m-      // console.log("Received message via socket:", data);[m
[32m+[m[32m      console.log("🔴 Received message via socket:", data);[m
       [m
       if (!data || !data.conversationId) {[m
         console.error("Invalid message data received:", data);[m
         return;[m
       }[m
       [m
[31m-      // Store received message by conversation ID[m
[32m+[m[32m      // Create a standardized message object[m
[32m+[m[32m      const msgTimestamp = data.timestamp || new Date().toISOString();[m
[32m+[m[32m      const newMessage = {[m
[32m+[m[32m        senderId: data.senderId,[m
[32m+[m[32m        message: data.message || '',[m
[32m+[m[32m        timestamp: msgTimestamp,[m
[32m+[m[32m        formattedTime: formatMessageTime(msgTimestamp),[m
[32m+[m[32m        status: data.status || 'delivered',[m
[32m+[m[32m        type: data.type || 'text',[m
[32m+[m[32m        attachmentUrl: data.attachmentUrl,[m
[32m+[m[32m        fileName: data.fileName || (data.attachmentUrl ? data.attachmentUrl.split('/').pop() : null)[m
[32m+[m[32m      };[m
[32m+[m[41m      [m
[32m+[m[32m      // CRITICAL FIX: Directly update chat if this is the currently selected conversation[m
[32m+[m[32m      const isCurrentConversation = selectedConversation &&[m[41m [m
[32m+[m[32m                                   selectedConversation.id &&[m[41m [m
[32m+[m[32m                                   selectedConversation.id.toString() === data.conversationId.toString();[m
[32m+[m[41m      [m
[32m+[m[32m      console.log(`Message for conversation ${data.conversationId}, current conversation: ${selectedConversation.id}`);[m
[32m+[m[32m      console.log(`Is current conversation: ${isCurrentConversation}`);[m
[32m+[m[41m      [m
[32m+[m[32m      // Store received message by conversation ID - this happens regardless of which conversation is active[m
       setReceivedMessages(prev => {[m
         const conversationMessages = prev[data.conversationId] || [];[m
         [m
[36m@@ -303,26 +348,15 @@[m [mconst Messages = () => {[m
         const messageExists = conversationMessages.some(msg => [m
           msg.message === data.message && [m
           msg.senderId === data.senderId &&[m
[31m-          msg.type === data.type &&[m
[31m-          Math.abs(new Date(msg.timestamp) - new Date(data.timestamp || new Date())) < 1000[m
[32m+[m[32m          Math.abs(new Date(msg.timestamp || new Date()) - new Date(data.timestamp || new Date())) < 1000[m
         );[m
         [m
         if (messageExists) {[m
[32m+[m[32m          console.log('Message already exists in received messages, not adding duplicate');[m
           return prev;[m
         }[m
         [m
[31m-        const msgTimestamp = data.timestamp || new Date().toISOString();[m
[31m-        const newMessage = {[m
[31m-          senderId: data.senderId,[m
[31m-          message: data.message || '',[m
[31m-          timestamp: msgTimestamp,[m
[31m-          formattedTime: formatMessageTime(msgTimestamp),[m
[31m-          status: data.status || 'delivered',[m
[31m-          type: data.type || 'text',[m
[31m-          attachmentUrl: data.attachmentUrl,[m
[31m-          fileName: data.fileName || (data.attachmentUrl ? data.attachmentUrl.split('/').pop() : null)[m
[31m-        };[m
[31m-        [m
[32m+[m[32m        console.log('Adding message to receivedMessages for conversation:', data.conversationId);[m
         return {[m
           ...prev,[m
           [data.conversationId]: [...conversationMessages, newMessage][m
[36m@@ -332,34 +366,110 @@[m [mconst Messages = () => {[m
       // Update conversations list with latest message[m
       setConversations(prevConversations => {[m
         return prevConversations.map(conv => {[m
[31m-          if (conv.id === data.conversationId) {[m
[31m-            const msgTimestamp = data.timestamp || new Date().toISOString();[m
[32m+[m[32m          if (conv.id.toString() === data.conversationId.toString()) {[m
[32m+[m[32m            console.log('Updating conversation list item with latest message');[m
             return {[m
               ...conv,[m
               lastMessage: data.lastMessagePreview || data.message || 'New message',[m
               timestamp: msgTimestamp,[m
               formattedTime: formatMessageTime(msgTimestamp),[m
[31m-              unread: conv.user.id === data.senderId ? conv.unread + 1 : conv.unread[m
[32m+[m[32m              unread: conv.user.id.toString() === data.senderId.toString() ? conv.unread : conv.unread + 1[m
             };[m
           }[m
           return conv;[m
         });[m
       });[m
[32m+[m[41m      [m
[32m+[m[32m      // If this message is for the currently selected conversation, update the chat immediately[m
[32m+[m[32m      if (isCurrentConversation) {[m
[32m+[m[32m        console.log('🟢 UPDATING ACTIVE CHAT with new message');[m
[32m+[m[41m        [m
[32m+[m[32m        // Force update the chat state with the new message[m
[32m+[m[32m        setChat(prevChat => {[m
[32m+[m[32m          // Check if message already exists in chat[m
[32m+[m[32m          const messageExists = prevChat.some(msg =>[m[41m [m
[32m+[m[32m            msg.message === newMessage.message &&[m[41m [m
[32m+[m[32m            msg.senderId === newMessage.senderId &&[m
[32m+[m[32m            Math.abs(new Date(msg.timestamp || new Date()) - new Date(newMessage.timestamp || new Date())) < 1000[m
[32m+[m[32m          );[m
[32m+[m[41m          [m
[32m+[m[32m          if (messageExists) {[m
[32m+[m[32m            console.log('Message already exists in chat, not adding duplicate');[m
[32m+[m[32m            return prevChat;[m
[32m+[m[32m          }[m
[32m+[m[41m          [m
[32m+[m[32m          console.log('Adding new message to chat:', newMessage);[m
[32m+[m[41m          [m
[32m+[m[32m          // Add new message and sort by timestamp[m
[32m+[m[32m          const updatedChat = [...prevChat, newMessage];[m
[32m+[m[32m          const sortedChat = updatedChat.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));[m
[32m+[m[41m          [m
[32m+[m[32m          return sortedChat;[m
[32m+[m[32m        });[m
[32m+[m[41m        [m
[32m+[m[32m        // Force scroll to bottom after a short delay to ensure the DOM has updated[m
[32m+[m[32m        setTimeout(() => {[m
[32m+[m[32m          if (chatEndRef.current) {[m
[32m+[m[32m            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });[m
[32m+[m[32m          }[m
[32m+[m[32m        }, 100);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log('Message not for current conversation');[m
[32m+[m[32m      }[m
     };[m
     [m
[32m+[m[32m    // CRITICAL FIX: Remove all existing listeners before adding new ones[m
[32m+[m[32m    socket.removeAllListeners('receive_message');[m
[32m+[m[41m    [m
[32m+[m[32m    // Add the new listener[m
     socket.on('receive_message', handleReceiveMessage);[m
[32m+[m[32m    console.log('Registered receive_message event handler');[m
[32m+[m[41m    [m
[32m+[m[32m    // Debug listener to track socket events[m
[32m+[m[32m    const handleDebugEvent = (event) => {[m
[32m+[m[32m      console.log(`Socket event '${event}' received`);[m
[32m+[m[32m    };[m
[32m+[m[41m    [m
[32m+[m[32m    // Listen for socket reconnection events[m
[32m+[m[32m    socket.on('reconnect', () => {[m
[32m+[m[32m      console.log('Socket reconnected, re-joining rooms');[m
[32m+[m[32m      // Re-join user room on reconnect[m
[32m+[m[32m      if (currentUser.current?.id) {[m
[32m+[m[32m        socket.emit('join', { userId: currentUser.current.id });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[41m    [m
[32m+[m[32m    socket.on('reconnect_attempt', handleDebugEvent.bind(null, 'reconnect_attempt'));[m
[32m+[m[32m    socket.on('reconnect_error', handleDebugEvent.bind(null, 'reconnect_error'));[m
[32m+[m[32m    socket.on('reconnect_failed', handleDebugEvent.bind(null, 'reconnect_failed'));[m
[32m+[m[41m    [m
[32m+[m[32m    // Test the socket connection[m
[32m+[m[32m    socket.emit('ping', { timestamp: new Date().toISOString() });[m
     [m
     return () => {[m
[31m-      socket.off('receive_message', handleReceiveMessage);[m
[32m+[m[32m      console.log('Cleaning up socket event listeners');[m
[32m+[m[32m      if (socket) {[m
[32m+[m[32m        socket.off('receive_message', handleReceiveMessage);[m
[32m+[m[32m        socket.off('reconnect');[m
[32m+[m[32m        socket.off('reconnect_attempt');[m
[32m+[m[32m        socket.off('reconnect_error');[m
[32m+[m[32m        socket.off('reconnect_failed');[m
[32m+[m[32m      }[m
     };[m
[31m-  }, []);[m
[32m+[m[32m  }, [selectedConversation.id]);[m
 [m
   // Update chat when selectedConversation or receivedMessages changes[m
   useEffect(() => {[m
     if (!selectedConversation.id) return;[m
     [m
[32m+[m[32m    console.log('Selected conversation changed or received messages updated');[m
[32m+[m[32m    console.log('Selected conversation ID:', selectedConversation.id);[m
[32m+[m[32m    console.log('Available received messages:', Object.keys(receivedMessages));[m
[32m+[m[41m    [m
     // Add received messages for this conversation to the chat[m
     const conversationMessages = receivedMessages[selectedConversation.id] || [];[m
[32m+[m[32m    console.log('Messages for this conversation:', conversationMessages.length);[m
[32m+[m[41m    [m
     if (conversationMessages.length > 0) {[m
       setChat(prevChat => {[m
         // Filter out messages that are already in the chat[m
[36m@@ -367,13 +477,28 @@[m [mconst Messages = () => {[m
           !prevChat.some(existingMsg => [m
             existingMsg.senderId === newMsg.senderId &&[m
             existingMsg.message === newMsg.message &&[m
[31m-            existingMsg.timestamp === newMsg.timestamp[m
[32m+[m[32m            Math.abs(new Date(existingMsg.timestamp) - new Date(newMsg.timestamp)) < 1000[m
           )[m
         );[m
         [m
[32m+[m[32m        console.log('New messages to add:', newMessages.length);[m
[32m+[m[41m        [m
         if (newMessages.length === 0) return prevChat;[m
[31m-        return [...prevChat, ...newMessages];[m
[32m+[m[41m        [m
[32m+[m[32m        // Sort messages by timestamp to ensure proper order[m
[32m+[m[32m        const updatedChat = [...prevChat, ...newMessages];[m
[32m+[m[32m        const sortedChat = updatedChat.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));[m
[32m+[m[41m        [m
[32m+[m[32m        console.log('Updated chat with new messages, total:', sortedChat.length);[m
[32m+[m[32m        return sortedChat;[m
       });[m
[32m+[m[41m      [m
[32m+[m[32m      // Force scroll to bottom after messages are added[m
[32m+[m[32m      setTimeout(() => {[m
[32m+[m[32m        if (chatEndRef.current) {[m
[32m+[m[32m          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });[m
[32m+[m[32m        }[m
[32m+[m[32m      }, 100);[m
     }[m
   }, [selectedConversation.id, receivedMessages]);[m
 [m
[36m@@ -385,7 +510,7 @@[m [mconst Messages = () => {[m
     if (chatEndRef.current) {[m
       chatEndRef.current.scrollIntoView({ behavior: 'smooth' });[m
     }[m
[31m-  }, [chat]);[m
[32m+[m[32m  }, [chat.length]);[m
 [m
   // Function to handle file attachment[m
   /**[m
[36m@@ -529,7 +654,23 @@[m [mconst Messages = () => {[m
       };[m
       [m
       // Emit via socket for real-time updates[m
[31m-      socket.emit('send_message', newMessage);[m
[32m+[m[32m      console.log('Sending message via socket:', newMessage);[m
[32m+[m[32m      if (socketRef.current) {[m
[32m+[m[32m        // Add the message to our own chat immediately for instant feedback[m
[32m+[m[32m        addMessageToChat({[m
[32m+[m[32m          senderId: currentUser.current.id,[m
[32m+[m[32m          message: messageInput,[m
[32m+[m[32m          timestamp: msgTimestamp,[m
[32m+[m[32m          attachmentUrl: temporaryAttachmentUrl,[m
[32m+[m[32m          type: messageType,[m
[32m+[m[32m          fileName: attachment?.name[m
[32m+[m[32m        });[m
[32m+[m[41m        [m
[32m+[m[32m        // Then send via socket[m
[32m+[m[32m        socketRef.current.emit('send_message', newMessage);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.error('Socket connection not available');[m
[32m+[m[32m      }[m
       [m
       // Update conversation list with latest message[m
       updateConversationList([m
[36m@@ -619,9 +760,10 @@[m [mconst Messages = () => {[m
   useEffect(() => {[m
     if (!selectedConversationId) return;[m
     [m
[32m+[m[32m    console.log('🔄 Fetching messages for conversation:', selectedConversationId);[m
[32m+[m[41m    [m
     const fetchMessages = async () => {[m
       try {[m
[31m-        // console.log("Fetching messages for conversation:", selectedConversationId);[m
         const response = await axios.get([m
           "http://localhost:8081/messages/retrieve",[m
           {[m
[36m@@ -630,21 +772,55 @@[m [mconst Messages = () => {[m
           }[m
         );[m
         [m
[31m-        // console.log("Messages API response:", response.data);[m
[32m+[m[32m        console.log("Messages API response received, count:", response.data?.length || 0);[m
         [m
         if (Array.isArray(response.data)) {[m
[31m-          setChat([m
[31m-            response.data.map(msg => ({[m
[31m-              senderId: msg.Sender_Id,[m
[31m-              message: msg.Content,[m
[31m-              timestamp: msg.Created_at,[m
[31m-              formattedTime: formatMessageTime(msg.Created_at),[m
[31m-              status: msg.Status,[m
[31m-              type: msg.Type || 'text',[m
[31m-              attachmentUrl: msg.Attachment_url,[m
[31m-              fileName: msg.Attachment_url ? msg.Attachment_url.split('/').pop() : null[m
[31m-            }))[m
[32m+[m[32m          // Process messages from the API[m
[32m+[m[32m          const apiMessages = response.data.map(msg => ({[m
[32m+[m[32m            senderId: msg.Sender_Id,[m
[32m+[m[32m            message: msg.Content,[m
[32m+[m[32m            timestamp: msg.Created_at,[m
[32m+[m[32m            formattedTime: formatMessageTime(msg.Created_at),[m
[32m+[m[32m            status: msg.Status,[m
[32m+[m[32m            type: msg.Type || 'text',[m
[32m+[m[32m            attachmentUrl: msg.Attachment_url,[m
[32m+[m[32m            fileName: msg.Attachment_url ? msg.Attachment_url.split('/').pop() : null[m
[32m+[m[32m          }));[m
[32m+[m[41m          [m
[32m+[m[32m          // Get any recent messages from the receivedMessages state[m
[32m+[m[32m          const recentMessages = receivedMessages[selectedConversationId] || [];[m
[32m+[m[41m          [m
[32m+[m[32m          // Combine both sources and remove duplicates[m
[32m+[m[32m          const allMessages = [...apiMessages];[m
[32m+[m[41m          [m
[32m+[m[32m          // Add recent messages that aren't already in the API response[m
[32m+[m[32m          recentMessages.forEach(recentMsg => {[m
[32m+[m[32m            const isDuplicate = apiMessages.some(apiMsg =>[m[41m [m
[32m+[m[32m              apiMsg.message === recentMsg.message &&[m[41m [m
[32m+[m[32m              apiMsg.senderId === recentMsg.senderId &&[m
[32m+[m[32m              Math.abs(new Date(apiMsg.timestamp || 0) - new Date(recentMsg.timestamp || 0)) < 1000[m
[32m+[m[32m            );[m
[32m+[m[41m            [m
[32m+[m[32m            if (!isDuplicate) {[m
[32m+[m[32m              console.log('Adding recent message not found in API response:', recentMsg);[m
[32m+[m[32m              allMessages.push(recentMsg);[m
[32m+[m[32m            }[m
[32m+[m[32m          });[m
[32m+[m[41m          [m
[32m+[m[32m          // Sort all messages by timestamp[m
[32m+[m[32m          const sortedMessages = allMessages.sort((a, b) =>[m[41m [m
[32m+[m[32m            new Date(a.timestamp || 0) - new Date(b.timestamp || 0)[m
           );[m
[32m+[m[41m          [m
[32m+[m[32m          console.log('Setting chat with combined messages, total:', sortedMessages.length);[m
[32m+[m[32m          setChat(sortedMessages);[m
[32m+[m[41m          [m
[32m+[m[32m          // Scroll to bottom after messages are loaded[m
[32m+[m[32m          setTimeout(() => {[m
[32m+[m[32m            if (chatEndRef.current) {[m
[32m+[m[32m              chatEndRef.current.scrollIntoView({ behavior: 'smooth' });[m
[32m+[m[32m            }[m
[32m+[m[32m          }, 100);[m
         } else {[m
           console.error("Unexpected response format:", response.data);[m
           setChat([]);[m
[36m@@ -656,7 +832,7 @@[m [mconst Messages = () => {[m
     };[m
     [m
     fetchMessages();[m
[31m-  }, [selectedConversationId]);[m
[32m+[m[32m  }, [selectedConversationId, receivedMessages]);[m
 [m
   if (loading) {[m
     return ([m
