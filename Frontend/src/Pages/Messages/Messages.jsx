import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPaperPlane, FaEllipsisV, FaCheck, FaCheckDouble, FaImage, FaPaperclip } from 'react-icons/fa';
import './Messages.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import {io} from 'socket.io-client'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isActive, setIsActive] = useState(true);
  const activityTimerRef = useRef(null);
  
  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      
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
        if (Date.now() - lastActivity > 300000) { // 5 minutes of inactivity
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
  }, [lastActivity, userStatus]);

  // Authentication check
  useEffect(() => {
    if (!currentUser.current || !currentUser.current.id) {
      navigate('/login');
      return;
    }

    // Setup socket connection
    console.log("Setting up socket connection for user:", currentUser.current.id);
    
    socket.connect();
    socket.emit('join', { userId: currentUser.current.id });
    
    // Request list of online users
    socket.emit('get_online_users');
    
    socket.on('connect', () => {
      console.log("Socket connected, ID:", socket.id);
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
      socket.disconnect();
    };
  }, [navigate]);

  // Fetch conversations
  useEffect(() => {
    const retriving_conversations = async () => {
      try {
        console.log("Fetching conversations for user:", currentUser.current.id);
        const response = await axios.get(
          "http://localhost:8081/retrive-conversations-by-id",
          {
            params: { User_Id: currentUser.current.id },
            withCredentials: true
          }
        );
        const processedConversations = response.data.map(conv => {
          const otherUserId = conv.User_one_id === currentUser.current.id ? 
            conv.User_two_id : conv.User_one_id;
          
          return {
            id: conv.ConversationId,
            user: {
              id: otherUserId,
              name: conv.Name || "Unknown User",
              avatar: conv.Image || DEFAULT_AVATAR,
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

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation.id) return;
    
    const fetchMessages = async () => {
      try {
        console.log("Fetching messages for conversation:", selectedConversation.id);
        const response = await axios.get(
          "http://localhost:8081/message/retrieve",
          {
            params: { conversation_id: selectedConversation.id },
            withCredentials: true
          }
        );
        setChat(
          response.data.map(msg => ({
            senderId: msg.Sender_Id,
            message: msg.Content,
            timestamp: msg.Created_at,
            formattedTime: formatMessageTime(msg.Created_at),
            status: msg.Status
          }))
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
        setChat([]);
      }
    };
    
    fetchMessages();
  }, [selectedConversation]);

  // Listen for new messages
  useEffect(() => {
    // Socket listener for receiving messages
    const handleReceiveMessage = (data) => {
      console.log("Received message via socket:", data);
      
      // Only update chat if message is for current conversation
      if (selectedConversation.id && data.conversationId === selectedConversation.id) {
        console.log("Adding new message to chat");
        setChat(prevChat => {
          // Check if message already exists by comparing content and sender
          const messageExists = prevChat.some(msg => 
            msg.message === data.message && 
            msg.senderId === data.senderId &&
            // Compare timestamps, accounting for small differences
            Math.abs(new Date(msg.timestamp) - new Date(data.timestamp || new Date())) < 1000
          );
          
          if (messageExists) {
            console.log("Message already exists in chat, not adding duplicate");
            return prevChat;
          }
          
          const msgTimestamp = data.timestamp || new Date().toISOString();
          
          return [...prevChat, {
            senderId: data.senderId,
            message: data.message,
            timestamp: msgTimestamp,
            formattedTime: formatMessageTime(msgTimestamp),
            status: data.status || 'delivered'
          }];
        });
      }
      
      // Update conversations list with latest message
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === data.conversationId) {
            const msgTimestamp = data.timestamp || new Date().toISOString();
            return {
              ...conv,
              lastMessage: data.message,
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
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  // Send message function
  const sendMessage = async() => {
    if (!selectedConversation.id || !messageInput.trim()) return;
    
    if (!currentUser.current || !currentUser.current.id) {
      console.error("No user is logged in");
      return;
    }
    
    const msgTimestamp = new Date().toISOString();
    
    const newMessage = {
      conversationId: selectedConversation.id,
      senderId: currentUser.current.id,
      receiverId: selectedConversation.user.id,
      message: messageInput,
      timestamp: msgTimestamp,
      status: 'sent'
    };
    
    // Add message to local state immediately
    setChat(prev => [...prev, {
      senderId: currentUser.current.id,
      message: messageInput,
      timestamp: msgTimestamp,
      formattedTime: formatMessageTime(msgTimestamp),
      status: 'sent'
    }]);
    
    // Clear input field
    setMessageInput('');
    
    try {
      console.log("Emitting send_message event:", newMessage);
      socket.emit('send_message', newMessage);
      
      // Also save to database
      const response = await axios.post(
        "http://localhost:8081/messages/upload",
        {
          Conversation_Id: selectedConversation.id,
          Sender_Id: currentUser.current.id,
          Content: newMessage.message,
          Type: "text",
          Status: "sent"
        },
        { withCredentials: true }
      );
      
      console.log("Message saved to database:", response.data);
      
      // Update conversations list with latest message
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              lastMessage: newMessage.message,
              timestamp: msgTimestamp,
              formattedTime: formatMessageTime(msgTimestamp)
            };
          }
          return conv;
        });
      });
    } catch(err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage();
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
    <div>
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
                    console.log("Selected conversation:", conversation);
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
                        <p>{message.message}</p>
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

              {/* Message input */}
              <form className="message-input-container" onSubmit={handleSendMessage}>
                <div className="message-input-wrapper">
                  <button type="button" className="attachment-button">
                    <FaPaperclip />
                  </button>
                  <button type="button" className="image-button">
                    <FaImage />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                  />
                  <button type="submit" className="send-button">
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
    </div>
  );
};

export default Messages; 