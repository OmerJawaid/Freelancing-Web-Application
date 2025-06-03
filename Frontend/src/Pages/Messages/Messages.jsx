import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaPaperPlane, FaEllipsisV, FaCheck, FaCheckDouble, FaImage, FaPaperclip, FaDownload, FaFile } from 'react-icons/fa';
import './Messages.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import {io} from 'socket.io-client'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Default avatar image
const DEFAULT_AVATAR = "https://placehold.co/100/e9ecef/495057?text=User";

// Function to ensure image paths are complete URLs
const getFullImagePath = (imagePath) => {
  if (!imagePath) return DEFAULT_AVATAR;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the server URL
  return `http://localhost:8081${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

// Create socket reference to be initialized inside the component
// This ensures proper cleanup and prevents memory leaks
let socket = null;

// Utility function to format timestamps
const formatMessageTime = (timestamp) => {
  if (!timestamp) return "Just now";
  
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // Check if invalid date
  if (isNaN(messageDate.getTime())) return "Invalid date";
  
  // Same day: show time only
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Within last 7 days: show day name
  const dayDiff = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
  if (dayDiff < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'short' }) + ' ' + 
           messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Otherwise show date
  return messageDate.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const Messages = () => {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState({});
  const [chat, setChat] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const currentUser = useRef(JSON.parse(localStorage.getItem('user')));
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [userStatus, setUserStatus] = useState('online');
  const [isActive, setIsActive] = useState(true);
  const activityTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [receivedMessages, setReceivedMessages] = useState({});
  const socketRef = useRef(null); // Reference to maintain socket instance

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      // Update the ref value instead of state to prevent re-renders
      lastActivityRef.current = Date.now();
      
      if (userStatus === 'away') {
        setUserStatus('online');
        socket.emit('set_user_status', { 
          userId: currentUser.current?.id, 
          status: 'online' 
        });
      }
      
      setIsActive(true);
      
      // Clear any existing timer
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
      
      // Set new timer for inactivity
      activityTimerRef.current = setTimeout(() => {
        if (Date.now() - lastActivityRef.current > 300000) { // 5 minutes of inactivity
          setUserStatus('away');
          setIsActive(false);
          
          // Use socketRef to ensure we're using the current socket instance
          if (socketRef.current) {
            socketRef.current.emit('set_user_status', { 
              userId: currentUser.current?.id, 
              status: 'away' 
            });
          }
        }
      }, 300000); // Check after 5 minutes
    };
    
    // Listen for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    
    // Initial activity timer
    handleActivity();
    
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
    };
  }, [userStatus]); // Only depend on userStatus, not lastActivity

  // Authentication check and socket setup
  useEffect(() => {
    // Get the logged-in user from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    // Parse and set the current user
    try {
      currentUser.current = JSON.parse(storedUser);
      if (!currentUser.current || !currentUser.current.id) {
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate('/login');
      return;
    }

    // Initialize socket connection
    console.log("Setting up socket connection for user:", currentUser.current.id);
    
    // Create new socket instance
    socketRef.current = io('http://localhost:8081', { 
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true
    });
    
    const socket = socketRef.current;
    
    // Handle connection events
    socket.on('connect', () => {
      console.log("Socket connected, ID:", socket.id);
      
      // Join user room and request online users after successful connection
      socket.emit('join', { userId: currentUser.current.id });
      socket.emit('get_online_users');
    });
    
    socket.on('connect_error', (error) => {
      console.error("Socket connection error:", error);
    });
    
    // Listen for online users list
    socket.on('online_users', (users) => {
      console.log("Received online users:", users);
      setOnlineUsers(new Set(users));
    });
    
    // Listen for user status changes
    socket.on('user_status_change', ({ userId, status }) => {
      console.log(`User ${userId} status changed to ${status}`);
      
      if (status === 'online') {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.add(userId);
          return updated;
        });
      } else if (status === 'offline') {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      }
      
      // Update selected conversation status if applicable
      if (selectedConversation.user && selectedConversation.user.id === parseInt(userId)) {
        setSelectedConversation(prev => ({
          ...prev,
          user: {
            ...prev.user,
            status: status
          }
        }));
      }
      
      // Update specific conversation in the list
      setConversations(prev => 
        prev.map(conv => {
          if (conv.user.id === parseInt(userId)) {
            return {
              ...conv,
              user: {
                ...conv.user,
                status: status
              }
            };
          }
          return conv;
        })
      );
    });

    // Clean up socket connection on component unmount
    return () => {
      console.log("Disconnecting socket");
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [navigate]);

  // Fetch conversations
  useEffect(() => {
    const retriving_conversations = async () => {
      try {
        // console.log("Fetching conversations for user:", currentUser.current.id);
        const response = await axios.get(
          "http://localhost:8081/conversations/retrieve",
          {
            params: { User_Id: currentUser.current.id },
            withCredentials: true
          }
        );
        
        // console.log("Conversations API response:", response.data);
        
        if (Array.isArray(response.data)) {
          const processedConversations = response.data.map(conv => {
            const otherUserId = conv.User_one_id === currentUser.current.id ? 
              conv.User_two_id : conv.User_one_id;
            
            return {
              id: conv.ConversationId,
              user: {
                id: otherUserId,
                name: conv.Name || "Unknown User",
                avatar: getFullImagePath(conv.Image),
                status: onlineUsers.has(otherUserId.toString()) ? 'online' : 'offline'
              },
              lastMessage: conv.Last_message || "",
              timestamp: conv.Last_message_time || null,
              formattedTime: formatMessageTime(conv.Last_message_time),
              unread: conv.User_one_id === currentUser.current.id ? 
                conv.Unread_count_user_one : conv.Unread_count_user_two
            };
          });
          setConversations(processedConversations);
        } else {
          console.error("Unexpected conversations response format:", response.data);
          setConversations([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setLoading(false);
      }
    };
    
    if (currentUser.current?.id) {
      retriving_conversations();
    }
  }, []);

  // Create a separate effect to update online status when onlineUsers changes
  useEffect(() => {
    if (conversations.length === 0 || !onlineUsers) return;
    
    setConversations(prevConversations => 
      prevConversations.map(conv => ({
        ...conv,
        user: {
          ...conv.user,
          status: onlineUsers.has(conv.user.id.toString()) ? 'online' : 'offline'
        }
      }))
    );
  }, [onlineUsers]);

  // Listen for new messages
  useEffect(() => {
    if (!socketRef.current) {
      console.error('Socket not initialized');
      return;
    }
    
    const socket = socketRef.current;
    console.log('Setting up message listener on socket:', socket.id);
    
    // Add debug listener for all events to help troubleshoot
    socket.onAny((event, ...args) => {
      console.log(`[SOCKET EVENT] ${event}`, event === 'receive_message' ? 'MESSAGE DATA RECEIVED' : args);
    });
    
    // Socket listener for receiving messages - IMPROVED FOR DEDUPLICATION
    const handleReceiveMessage = (data) => {
      console.log("🔴 Received message via socket:", data);
      
      if (!data || !data.conversationId) {
        console.error("Invalid message data received:", data);
        return;
      }
      
      // Create a standardized message object
      const msgTimestamp = data.timestamp || new Date().toISOString();
      const newMessage = {
        senderId: data.senderId,
        conversationId: data.conversationId, // Add conversation ID for better tracking
        message: data.message || '',
        timestamp: msgTimestamp,
        formattedTime: formatMessageTime(msgTimestamp),
        status: data.status || 'delivered',
        type: data.type || 'text',
        attachmentUrl: data.attachmentUrl,
        fileName: data.fileName || (data.attachmentUrl ? data.attachmentUrl.split('/').pop() : null),
        source: 'socket' // Mark as coming from socket for debugging
      };
      
      // CRITICAL FIX: Directly update chat if this is the currently selected conversation
      const isCurrentConversation = selectedConversation && 
                                   selectedConversation.id && 
                                   selectedConversation.id.toString() === data.conversationId.toString();
      
      console.log(`Message for conversation ${data.conversationId}, current conversation: ${selectedConversation.id}`);
      
      // Create a deterministic message ID for deduplication
      const messageKey = `${data.senderId}_${data.message}_${Math.floor(new Date(msgTimestamp).getTime() / 1000)}`;
      
      // Store received message by conversation ID - this happens regardless of which conversation is active
      setReceivedMessages(prev => {
        const conversationMessages = prev[data.conversationId] || [];
        
        // Improved duplicate detection using our message key approach
        const existingMessages = conversationMessages.filter(msg => {
          const existingKey = `${msg.senderId}_${msg.message}_${Math.floor(new Date(msg.timestamp).getTime() / 1000)}`;
          return existingKey === messageKey;
        });
        
        if (existingMessages.length > 0) {
          console.log('Message already exists in receivedMessages with key:', messageKey);
          return prev;
        }
        
        console.log('Adding message to receivedMessages for conversation:', data.conversationId);
        return {
          ...prev,
          [data.conversationId]: [...conversationMessages, newMessage]
        };
      });
      
      // Update conversations list with latest message and sort by timestamp
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conv => {
          if (conv.id.toString() === data.conversationId.toString()) {
            return {
              ...conv,
              lastMessage: data.lastMessagePreview || data.message || 'New message',
              timestamp: msgTimestamp,
              formattedTime: formatMessageTime(msgTimestamp),
              // Only increment unread if the message is from the other user
              unread: data.senderId.toString() !== currentUser.current.id.toString() ? (conv.unread || 0) + 1 : conv.unread || 0
            };
          }
          return conv;
        });
        
        // Sort conversations by timestamp (most recent first)
        return updatedConversations.sort((a, b) => 
          new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        );
      });
      
      // If this message is for the currently selected conversation, update the chat immediately
      if (isCurrentConversation) {
        console.log('🟢 UPDATING ACTIVE CHAT with new message');
        
        // Force update the chat state with the new message
        setChat(prevChat => {
          // Improved duplicate detection using our message key approach
          const existingMessages = prevChat.filter(msg => {
            // If the message doesn't have a conversationId, it's likely from before our fix
            const msgConvId = msg.conversationId || selectedConversation.id;
            // Only check messages from the same conversation
            if (msgConvId.toString() !== data.conversationId.toString()) return false;
            
            // Generate key for existing message
            const existingKey = `${msg.senderId}_${msg.message}_${Math.floor(new Date(msg.timestamp).getTime() / 1000)}`;
            return existingKey === messageKey;
          });
          
          if (existingMessages.length > 0) {
            console.log('Message already exists in chat with key:', messageKey);
            return prevChat;
          }
          
          console.log('Adding new message to chat:', newMessage);
          
          // Add new message and sort by timestamp
          const updatedChat = [...prevChat, newMessage];
          const sortedChat = updatedChat.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
          
          return sortedChat;
        });
        
        // Force scroll to bottom after a short delay to ensure the DOM has updated
        setTimeout(() => {
          if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        console.log('Message not for current conversation');
      }
    };
    
    // CRITICAL FIX: Remove specific listener before adding new one
    socket.off('receive_message');
    
    // Add the new listener
    socket.on('receive_message', handleReceiveMessage);
    console.log('Registered receive_message event handler');
    
    // Ensure we're connected to the conversation room
    if (selectedConversation && selectedConversation.id) {
      console.log(`Joining conversation room: conversation_${selectedConversation.id}`);
      socket.emit('join_conversation', { conversationId: selectedConversation.id });
    }
    
    // Debug listener to track socket events
    const handleDebugEvent = (event) => {
      console.log(`Socket event '${event}' received`);
    };
    
    // Listen for socket reconnection events
    socket.on('reconnect', () => {
      console.log('Socket reconnected, re-joining rooms');
      // Re-join user room on reconnect
      if (currentUser.current?.id) {
        socket.emit('join', { userId: currentUser.current.id });
      }
    });
    
    socket.on('reconnect_attempt', handleDebugEvent.bind(null, 'reconnect_attempt'));
    socket.on('reconnect_error', handleDebugEvent.bind(null, 'reconnect_error'));
    socket.on('reconnect_failed', handleDebugEvent.bind(null, 'reconnect_failed'));
    
    // Test the socket connection
    socket.emit('ping', { timestamp: new Date().toISOString() });
    
    return () => {
      console.log('Cleaning up socket event listeners');
      if (socket) {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('reconnect');
        socket.off('reconnect_attempt');
        socket.off('reconnect_error');
        socket.off('reconnect_failed');
      }
    };
  }, [selectedConversation.id]);

  // Update chat when selectedConversation changes - removed receivedMessages dependency
  useEffect(() => {
    if (!selectedConversation.id) return;
    
    console.log('Selected conversation changed');
    console.log('Selected conversation ID:', selectedConversation.id);
    console.log('Available received messages:', Object.keys(receivedMessages));
    
    // We'll handle this differently now - we'll only use this effect for initial loading
    // and for handling conversation changes, not for every receivedMessages update
    const conversationMessages = receivedMessages[selectedConversation.id] || [];
    console.log('Messages for this conversation in cache:', conversationMessages.length);
    
    // Only process these messages if we don't already have messages loaded (initial load)
    // or if we've switched conversations
    const isNewConversation = !chat.length || 
      (chat.length > 0 && chat[0].conversationId !== selectedConversation.id);
    
    if (isNewConversation && conversationMessages.length > 0) {
      console.log('New conversation selected, adding cached socket messages');
      
      setChat(prevChat => {
        // If it's a new conversation, just use the cached messages directly
        // Otherwise, do deduplication
        if (prevChat.length === 0 || isNewConversation) {
          const sortedMessages = [...conversationMessages].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          return sortedMessages;
        }
        
        // For existing conversations, do deduplication
        const newMessages = conversationMessages.filter(newMsg => 
          !prevChat.some(existingMsg => 
            existingMsg.senderId === newMsg.senderId &&
            existingMsg.message === newMsg.message &&
            Math.abs(new Date(existingMsg.timestamp) - new Date(newMsg.timestamp)) < 1000
          )
        );
        
        if (newMessages.length === 0) return prevChat;
        
        const updatedChat = [...prevChat, ...newMessages];
        return updatedChat.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
      
      // Scroll to bottom after messages are added
      setTimeout(() => {
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [selectedConversation.id]); // Only trigger when conversation changes, not on receivedMessages updates

  // Create a separate memo for selected conversation ID for message filtering
  const selectedConversationId = selectedConversation?.id;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.length]);

  // Function to handle file attachment
  /**
   * Handle file selection from the file input
   * Creates a preview for image files
   * @param {Event} e - The file input change event
   */
  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setAttachment(file);
    
    // Create preview based on file type
    if (file.type.startsWith('image/')) {
      createImagePreview(file);
    } else {
      // For non-image files, clear image preview
      setAttachmentPreview(null);
    }
  };

  /**
   * Create a preview image for image attachments using FileReader
   * @param {File} imageFile - The image file to preview
   */
  const createImagePreview = (imageFile) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentPreview(reader.result);
    };
    reader.readAsDataURL(imageFile);
  };

  /**
   * Trigger the hidden file input click
   * @param {string} [acceptType] - Optional file type filter (e.g., 'image/*')
   */
  const triggerFileInput = (acceptType) => {
    if (acceptType && fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
    }
    fileInputRef.current.click();
  };

  /**
   * Clear the current attachment and preview
   */
  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Send a message or attachment to the selected conversation
   */
  const sendMessage = async() => {
    // Validate basic requirements
    if (!selectedConversation.id || (!messageInput.trim() && !attachment)) return;
    
    if (!currentUser.current?.id) {
      console.error("No user is logged in");
      return;
    }
    
    const msgTimestamp = new Date().toISOString();
    
    try {
      // ===== Prepare message data =====
      
      // Create FormData for API request
      const formData = new FormData();
      formData.append('Conversation_Id', selectedConversation.id);
      formData.append('Sender_Id', currentUser.current.id);
      formData.append('Receiver_Id', selectedConversation.user.id); // Make sure to include receiver ID
      formData.append('Status', 'sent');
      
      // Add text content and determine message type
      formData.append('Content', messageInput);
      
      // Set message type based on attachment
      const messageType = getMessageType(attachment);
      formData.append('Type', messageType);
      
      // Add attachment if present
      if (attachment) {
        formData.append('attachment', attachment);
      }
      
      // Create temporary attachment URL for immediate display
      const temporaryAttachmentUrl = attachment 
        ? createTemporaryAttachmentUrl(attachment, attachmentPreview)
        : null;
      
      // ===== Update UI immediately for responsiveness =====
      
      // Add message to chat display
      addMessageToChat({
        senderId: currentUser.current.id,
        message: messageInput,
        timestamp: msgTimestamp,
        attachmentUrl: temporaryAttachmentUrl,
        type: messageType,
        fileName: attachment?.name
      });
      
      // Clear input fields
      setMessageInput('');
      clearAttachment();
      
      // ===== Send to server =====
      
      // Submit to API
      const response = await axios.post(
        "http://localhost:8081/messages/upload",
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // console.log("Message saved to database:", response.data);
      
      // ===== Update with server data =====
      
      // Prepare socket message
      const newMessage = {
        conversationId: selectedConversation.id,
        senderId: currentUser.current.id,
        receiverId: selectedConversation.user.id,
        message: messageInput,
        timestamp: msgTimestamp,
        status: 'sent',
        attachmentUrl: response.data.attachmentUrl,
        type: response.data.type
      };
      
      // Emit via socket for real-time updates
      console.log('Sending message via socket:', newMessage);
      if (socketRef.current) {
        // Add the message to our own chat immediately for instant feedback
        addMessageToChat({
          senderId: currentUser.current.id,
          message: messageInput,
          timestamp: msgTimestamp,
          attachmentUrl: temporaryAttachmentUrl,
          type: messageType,
          fileName: attachment?.name
        });
        
        // Then send via socket
        socketRef.current.emit('send_message', newMessage);
      } else {
        console.error('Socket connection not available');
      }
      
      // Update conversation list with latest message
      updateConversationList(
        selectedConversation.id, 
        response.data.lastMessagePreview || messageInput,
        msgTimestamp
      );
    } catch(err) {
      console.error("Error sending message:", err);
    }
  };

  /**
   * Determine message type based on attachment
   * @param {File} attachment - The file attachment if any
   * @returns {string} The message type (text, image, or file)
   */
  const getMessageType = (attachment) => {
    if (!attachment) return 'text';
    return attachment.type.startsWith('image/') ? 'image' : 'file';
  };

  /**
   * Create a temporary URL for an attachment to show before server response
   * @param {File} attachment - The file being attached
   * @param {string} preview - Image preview data URL if available
   * @returns {string} URL for temporary display
   */
  const createTemporaryAttachmentUrl = (attachment, preview) => {
    if (attachment.type.startsWith('image/')) {
      return preview; // Use preview data URL for images
    } else {
      return URL.createObjectURL(attachment); // Create temporary URL for files
    }
  };

  /**
   * Add a new message to the chat display
   * @param {Object} messageData - The message data
   */
  const addMessageToChat = (messageData) => {
    const { senderId, message, timestamp, attachmentUrl, type, fileName } = messageData;
    
    setChat(prev => [...prev, {
      senderId,
      message,
      timestamp,
      formattedTime: formatMessageTime(timestamp),
      status: 'sent',
      attachmentUrl,
      type,
      fileName
    }]);
  };

  /**
   * Update the conversation list with the latest message
   * @param {number} conversationId - The ID of the conversation to update
   * @param {string} messageText - The message text or preview
   * @param {string} timestamp - ISO timestamp string
   */
  const updateConversationList = (conversationId, messageText, timestamp) => {
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: messageText,
            timestamp,
            formattedTime: formatMessageTime(timestamp)
          };
        }
        return conv;
      });
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Allow sending if there's either message text OR an attachment
    if (messageInput.trim() || attachment) {
      sendMessage();
    }
  };

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversationId) return;
    
    console.log('🔄 Fetching messages for conversation:', selectedConversationId);
    
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/messages/retrieve",
          {
            params: { conversation_id: selectedConversationId },
            withCredentials: true
          }
        );
        
        console.log("Messages API response received, count:", response.data?.length || 0);
        
        if (Array.isArray(response.data)) {
          // Process messages from the API
          const apiMessages = response.data.map(msg => ({
            senderId: msg.Sender_Id,
            conversationId: selectedConversationId, // Add conversation ID to each message
            message: msg.Content,
            timestamp: msg.Created_at,
            formattedTime: formatMessageTime(msg.Created_at),
            status: msg.Status,
            type: msg.Type || 'text',
            attachmentUrl: msg.Attachment_url,
            fileName: msg.Attachment_url ? msg.Attachment_url.split('/').pop() : null,
            source: 'database' // Mark the source for debugging
          }));
          
          // Get any recent messages from the receivedMessages state for this conversation
          const recentMessages = receivedMessages[selectedConversationId] || [];
          
          if (recentMessages.length > 0) {
            console.log('Found socket messages for this conversation:', recentMessages.length);
          }
          
          // Create a lookup map from API messages for faster deduplication
          const apiMessageMap = new Map();
          apiMessages.forEach(msg => {
            // Create a unique key based on sender, content and approximate timestamp
            const timestampKey = new Date(msg.timestamp).getTime();
            const key = `${msg.senderId}_${msg.message}_${Math.floor(timestampKey / 1000)}`;
            apiMessageMap.set(key, msg);
          });
          
          // Filter recent socket messages to only include those not in the API response
          const uniqueSocketMessages = recentMessages.filter(socketMsg => {
            const timestampKey = new Date(socketMsg.timestamp).getTime();
            const key = `${socketMsg.senderId}_${socketMsg.message}_${Math.floor(timestampKey / 1000)}`;
            return !apiMessageMap.has(key);
          }).map(msg => ({
            ...msg,
            conversationId: selectedConversationId,
            source: 'socket' // Mark the source for debugging
          }));
          
          if (uniqueSocketMessages.length > 0) {
            console.log('Adding unique socket messages not in DB:', uniqueSocketMessages.length);
          }
          
          // Combine API messages with unique socket messages
          const allMessages = [...apiMessages, ...uniqueSocketMessages];
          
          // Sort all messages by timestamp
          const sortedMessages = allMessages.sort((a, b) => 
            new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
          );
          
          console.log('Setting chat with combined messages, total:', sortedMessages.length);
          setChat(sortedMessages);
          
          // Scroll to bottom after messages are loaded
          setTimeout(() => {
            if (chatEndRef.current) {
              chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        } else {
          console.error("Unexpected response format:", response.data);
          setChat([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setChat([]);
      }
    };
    
    fetchMessages();
  }, [selectedConversationId, receivedMessages]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <Navbar/>
      <div className="messages-container">
        {/* Sidebar with conversations */}
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <h2>Messages</h2>
            <div className="search-container">
              <FaSearch className="search-icon" style={{color:'black'}}/>
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="search-input"
                style={{color:'black'}}
              />
            </div>
          </div>
          
          <div className="conversations-list">
            {conversations && conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div 
                  key={conversation.id || Math.random()}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => {
                    // console.log("Selected conversation:", conversation);
                    setSelectedConversation(conversation);
                  }}
                >
                  <div className="conversation-avatar">
                    <img 
                      src={conversation.user.avatar}
                      alt={conversation.user.name || "User"}
                      onError={(e) => {
                        console.log("Avatar load error, using default");
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR;
                      }}
                      className="user-avatar-img"
                    />
                    <span className={`status-indicator ${conversation.user?.status || 'offline'}`} />
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <h3>{conversation.user?.name || "Unknown User"}</h3>
                      <span className="timestamp">{conversation.formattedTime}</span>
                    </div>
                    <div className="conversation-preview">
                      <p>{conversation.lastMessage || "No messages yet"}</p>
                      {conversation.unread > 0 && (
                        <span className="unread-badge">{conversation.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-conversations">
                <p>No conversations found</p>
                {loading ? <p>Loading...</p> : null}
              </div>
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="chat-area">
          {selectedConversation.id ? (
            <>
              {/* Chat header */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <img 
                    src={selectedConversation.user.avatar} 
                    alt={selectedConversation.user.name} 
                    className="chat-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                  <div>
                    <h3>{selectedConversation.user.name}</h3>
                    <span className={`status-text ${selectedConversation.user?.status || 'offline'}`}>
                      {selectedConversation.user?.status === 'online' ? 'Online' : 
                       selectedConversation.user?.status === 'away' ? 'Away' : 'Offline'}
                    </span>
                  </div>
                </div>
                <button className="more-options">
                  <FaEllipsisV />
                </button>
              </div>

              {/* Messages container */}
              <div className="chat-messages">
                {chat.map((message, index) => {
                  const isSent = message.senderId === currentUser.current?.id;
                  
                  return (
                    <div 
                      key={index}
                      className={`message ${isSent ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        {/* Render image attachments */}
                        {message.type === 'image' && message.attachmentUrl && (
                          <div className="message-attachment">
                            <img 
                              src={message.attachmentUrl.startsWith('data:') 
                                ? message.attachmentUrl  // Local preview URL
                                : `http://localhost:8081${message.attachmentUrl}`} // Server URL
                              alt="Image attachment" 
                              className="message-image" 
                              onClick={() => window.open(
                                message.attachmentUrl.startsWith('data:') 
                                  ? message.attachmentUrl 
                                  : `http://localhost:8081${message.attachmentUrl}`, 
                                '_blank'
                              )}
                            />
                          </div>
                        )}
                        
                        {/* Render file attachments */}
                        {message.type === 'file' && message.attachmentUrl && (
                          <div className="message-attachment file-attachment">
                            <FaFile className="file-icon" />
                            <span className="file-name">
                              {message.fileName || message.attachmentUrl.split('/').pop()}
                            </span>
                            <a 
                              href={`http://localhost:8081${message.attachmentUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              download
                              className="download-button"
                            >
                              <FaDownload />
                            </a>
                          </div>
                        )}
                        
                        {/* Render message text only if it's not empty */}
                        {message.message && (
                          <p>{message.message}</p>
                        )}
                        <div className="message-meta">
                          <span className="timestamp">{message.formattedTime}</span>
                          {isSent && (
                            <span className="status">
                              {message.status === 'read' ? <FaCheckDouble /> : <FaCheck />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Attachment preview */}
              {attachmentPreview && (
                <div className="attachment-preview">
                  <img src={attachmentPreview} alt="Attachment preview" />
                  <button className="clear-attachment" onClick={clearAttachment}>×</button>
                </div>
              )}
              {attachment && !attachmentPreview && (
                <div className="attachment-preview file-preview">
                  <div className="file-info">
                    <FaFile className="file-icon" />
                    <span className="file-name">{attachment.name}</span>
                  </div>
                  <button className="clear-attachment" onClick={clearAttachment}>×</button>
                </div>
              )}

              {/* Message input */}
              <form className="message-input-container" onSubmit={handleSendMessage}>
                <div className="message-input-wrapper">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAttachment} 
                    style={{ display: 'none' }} 
                  />
                  <button type="button" className="attachment-button" onClick={() => triggerFileInput()}>
                    <FaPaperclip />
                  </button>
                  <button type="button" className="image-button" onClick={() => triggerFileInput('image/*')}>
                    <FaImage />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                  />
                  <button type="submit" className="send-button" disabled={!messageInput.trim() && !attachment}>
                    <FaPaperPlane />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <h2>Select a conversation</h2>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
      {/* Debug info panel */}
      {debugInfo && (
        <div className="debug-info-panel">
          {debugInfo}
        </div>
      )}
    </div>
  );
};

export default Messages; 