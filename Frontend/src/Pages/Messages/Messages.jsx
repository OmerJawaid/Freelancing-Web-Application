import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaPaperPlane, FaEllipsisV, FaCheck, FaCheckDouble, FaImage, FaPaperclip, FaDownload, FaFile } from 'react-icons/fa';
import './Messages.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import {io} from 'socket.io-client'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, DEFAULT_USER_IMAGE } from '../../utils/imageUtils';

// Default avatar image
const DEFAULT_AVATAR = "https://placehold.co/100/e9ecef/495057?text=User";

// Create socket outside component to prevent multiple connections
const socket = io('http://localhost:8081', { 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

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
          socket.emit('set_user_status', { 
            userId: currentUser.current?.id, 
            status: 'away' 
          });
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

  // Authentication check
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

    // Setup socket connection
    // console.log("Setting up socket connection for user:", currentUser.current.id);
    
    socket.connect();
    socket.emit('join', { userId: currentUser.current.id });
    
    // Request list of online users
    socket.emit('get_online_users');
    
    socket.on('connect', () => {
      // console.log("Socket connected, ID:", socket.id);
    });
    
    socket.on('connect_error', (error) => {
      console.error("Socket connection error:", error);
    });
    
    // Listen for online users list
    socket.on('online_users', (users) => {
      // console.log("Received online users:", users);
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
      // console.log("Disconnecting socket");
      socket.disconnect();
    };
  }, [navigate]);

  // Fetch conversations
  useEffect(() => {
    const retriving_conversations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/conversations/retrieve",
          {
            params: { User_Id: currentUser.current.id },
            withCredentials: true
          }
        );
        
        if (Array.isArray(response.data)) {
          const processedConversations = response.data.map(conv => {
            const otherUserId = conv.User_one_id === currentUser.current.id ? 
              conv.User_two_id : conv.User_one_id;
            
            return {
              id: conv.ConversationId,
              user: {
                id: otherUserId,
                name: conv.Name || "Unknown User",
                avatar: getImageUrl(conv.Image, DEFAULT_USER_IMAGE),
                status: onlineUsers.has(otherUserId.toString()) ? 'online' : 'offline'
              },
              lastMessage: conv.Last_message || "",
              timestamp: conv.Last_message_time || null,
              formattedTime: formatMessageTime(conv.Last_message_time),
              unreadCount: conv.unread_count || 0
            };
          });

          setConversations(processedConversations);
          
          // If URL has conversation parameter, select that conversation
          const urlParams = new URLSearchParams(window.location.search);
          const conversationId = urlParams.get('conversation');
          if (conversationId) {
            const conversation = processedConversations.find(c => c.id === parseInt(conversationId));
            if (conversation) {
              setSelectedConversation(conversation);
            }
          }
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
  }, [onlineUsers]);

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
    // Socket listener for receiving messages
    const handleReceiveMessage = (data) => {
      // console.log("Received message via socket:", data);
      
      if (!data || !data.conversationId) {
        console.error("Invalid message data received:", data);
        return;
      }
      
      // Store received message by conversation ID
      setReceivedMessages(prev => {
        const conversationMessages = prev[data.conversationId] || [];
        
        // Check if message already exists
        const messageExists = conversationMessages.some(msg => 
          msg.message === data.message && 
          msg.senderId === data.senderId &&
          msg.type === data.type &&
          Math.abs(new Date(msg.timestamp) - new Date(data.timestamp || new Date())) < 1000
        );
        
        if (messageExists) {
          return prev;
        }
        
        const msgTimestamp = data.timestamp || new Date().toISOString();
        const newMessage = {
          senderId: data.senderId,
          message: data.message || '',
          timestamp: msgTimestamp,
          formattedTime: formatMessageTime(msgTimestamp),
          status: data.status || 'delivered',
          type: data.type || 'text',
          attachmentUrl: data.attachmentUrl,
          fileName: data.fileName || (data.attachmentUrl ? data.attachmentUrl.split('/').pop() : null)
        };
        
        return {
          ...prev,
          [data.conversationId]: [...conversationMessages, newMessage]
        };
      });
      
      // Update conversations list with latest message
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === data.conversationId) {
            const msgTimestamp = data.timestamp || new Date().toISOString();
            return {
              ...conv,
              lastMessage: data.lastMessagePreview || data.message || 'New message',
              timestamp: msgTimestamp,
              formattedTime: formatMessageTime(msgTimestamp),
              unread: conv.user.id === data.senderId ? conv.unread + 1 : conv.unread
            };
          }
          return conv;
        });
      });
    };
    
    socket.on('receive_message', handleReceiveMessage);
    
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, []);

  // Update chat when selectedConversation or receivedMessages changes
  useEffect(() => {
    if (!selectedConversation.id) return;
    
    // Add received messages for this conversation to the chat
    const conversationMessages = receivedMessages[selectedConversation.id] || [];
    if (conversationMessages.length > 0) {
      setChat(prevChat => {
        // Filter out messages that are already in the chat
        const newMessages = conversationMessages.filter(newMsg => 
          !prevChat.some(existingMsg => 
            existingMsg.senderId === newMsg.senderId &&
            existingMsg.message === newMsg.message &&
            existingMsg.timestamp === newMsg.timestamp
          )
        );
        
        if (newMessages.length === 0) return prevChat;
        return [...prevChat, ...newMessages];
      });
    }
  }, [selectedConversation.id, receivedMessages]);

  // Create a separate memo for selected conversation ID for message filtering
  const selectedConversationId = selectedConversation?.id;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  // Function to handle file attachments
  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setAttachment(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      createImagePreview(file);
    } else {
      // For non-image files, just show the filename
      setAttachmentPreview(file.name);
    }
  };

  // Function to create image preview
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
      socket.emit('send_message', newMessage);
      
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
    
    const fetchMessages = async () => {
      try {
        // console.log("Fetching messages for conversation:", selectedConversationId);
        const response = await axios.get(
          "http://localhost:8081/messages/retrieve",
          {
            params: { conversation_id: selectedConversationId },
            withCredentials: true
          }
        );
        
        // console.log("Messages API response:", response.data);
        
        if (Array.isArray(response.data)) {
          setChat(
            response.data.map(msg => ({
              senderId: msg.Sender_Id,
              message: msg.Content,
              timestamp: msg.Created_at,
              formattedTime: formatMessageTime(msg.Created_at),
              status: msg.Status,
              type: msg.Type || 'text',
              attachmentUrl: msg.Attachment_url,
              fileName: msg.Attachment_url ? msg.Attachment_url.split('/').pop() : null
            }))
          );
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
  }, [selectedConversationId]);

  // Function to handle message with attachment
  const handleMessageWithAttachment = async (messageData) => {
    try {
      const formData = new FormData();
      formData.append('file', attachment);
      formData.append('message', messageData.message);
      formData.append('conversation_id', messageData.conversation_id);
      formData.append('sender_id', messageData.sender_id);
      formData.append('receiver_id', messageData.receiver_id);

      const response = await axios.post('http://localhost:8081/messages/send-with-attachment', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data && response.data.message) {
        const attachmentUrl = response.data.attachment_path;
        
        // Add message to chat with attachment
        addMessageToChat({
          ...messageData,
          id: response.data.message_id,
          attachment: attachmentUrl,
          attachment_type: attachment.type.startsWith('image/') ? 'image' : 'file',
          timestamp: new Date().toISOString()
        });

        // Update conversation list
        updateConversationList(
          messageData.conversation_id,
          messageData.message,
          new Date().toISOString()
        );

        // Clear attachment and input
        setAttachment(null);
        setAttachmentPreview(null);
        setMessageInput('');
      }
    } catch (error) {
      console.error('Error sending message with attachment:', error);
      alert('Failed to send message with attachment');
    }
  };

  // Function to render message attachment
  const renderAttachment = (message) => {
    if (!message.attachment) return null;

    if (message.attachment_type === 'image') {
      return (
        <div className="image-attachment">
          <img 
            src={getImageUrl(message.attachment)} 
            alt="Attachment"
            onError={(e) => {
              console.error('Error loading image attachment:', message.attachment);
              e.target.style.display = 'none';
            }}
            onClick={() => window.open(getImageUrl(message.attachment), '_blank')}
          />
        </div>
      );
    } else {
      return (
        <div className="file-attachment">
          <FaFile className="file-icon" />
          <span className="file-name">{message.attachment.split('/').pop()}</span>
          <FaDownload 
            className="download-icon" 
            onClick={() => handleDownload(message.attachment)}
          />
        </div>
      );
    }
  };

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
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="search-input"
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
                        e.target.src = DEFAULT_USER_IMAGE;
                      }}
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
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
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
                      e.target.src = DEFAULT_USER_IMAGE;
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