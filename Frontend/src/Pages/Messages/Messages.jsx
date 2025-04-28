import React, { useState } from 'react';
import { FaSearch, FaPaperPlane, FaEllipsisV, FaCheck, FaCheckDouble, FaImage, FaPaperclip } from 'react-icons/fa';
import './Messages.css';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  // Mock data for conversations
  const conversations = [
    {
      id: 1,
      user: {
        id: 101,
        name: "John Smith",
        avatar: "https://placehold.co/100/e9ecef/495057?text=JS",
        status: "online",
        role: "client"
      },
      lastMessage: "When will the project be completed?",
      timestamp: "10:30 AM",
      unread: 2
    },
    {
      id: 2,
      user: {
        id: 102,
        name: "Sarah Johnson",
        avatar: "https://placehold.co/100/e9ecef/495057?text=SJ",
        status: "offline",
        role: "freelancer"
      },
      lastMessage: "I've sent you the updated design files",
      timestamp: "Yesterday",
      unread: 0
    },
    // Add more mock conversations as needed
  ];

  // Mock data for messages
  const messages = [
    {
      id: 1,
      senderId: 101,
      content: "Hi, I'm interested in your web development services",
      timestamp: "10:15 AM",
      status: "read"
    },
    {
      id: 2,
      senderId: 102,
      content: "Hello! Thanks for your interest. I'd be happy to help with your web development needs. What kind of project are you looking to build?",
      timestamp: "10:20 AM",
      status: "read"
    },
    {
      id: 3,
      senderId: 101,
      content: "I need a responsive e-commerce website with payment integration",
      timestamp: "10:25 AM",
      status: "read"
    },
    {
      id: 4,
      senderId: 102,
      content: "I can definitely help with that. I have experience building e-commerce sites using React and Node.js. Would you like to see some of my previous work?",
      timestamp: "10:28 AM",
      status: "read"
    },
    {
      id: 5,
      senderId: 101,
      content: "Yes, please share your portfolio",
      timestamp: "10:30 AM",
      status: "sent"
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      // Handle sending message
      setMessageInput('');
    }
  };

  return (
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
          {conversations.map((conversation) => (
            <div 
              key={conversation.id}
              className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="conversation-avatar">
                <img src={conversation.user.avatar} alt={conversation.user.name} />
                <span className={`status-indicator ${conversation.user.status}`} />
              </div>
              <div className="conversation-details">
                <div className="conversation-header">
                  <h3>{conversation.user.name}</h3>
                  <span className="timestamp">{conversation.timestamp}</span>
                </div>
                <div className="conversation-preview">
                  <p>{conversation.lastMessage}</p>
                  {conversation.unread > 0 && (
                    <span className="unread-badge">{conversation.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="chat-area">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <img 
                  src={selectedConversation.user.avatar} 
                  alt={selectedConversation.user.name} 
                  className="chat-avatar"
                />
                <div>
                  <h3>{selectedConversation.user.name}</h3>
                  <span className={`status-text ${selectedConversation.user.status}`}>
                    {selectedConversation.user.status}
                  </span>
                </div>
              </div>
              <button className="more-options">
                <FaEllipsisV />
              </button>
            </div>

            {/* Messages container */}
            <div className="messages-container">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`message ${message.senderId === 102 ? 'received' : 'sent'}`}
                >
                  <div className="message-content">
                    <p>{message.content}</p>
                    <div className="message-meta">
                      <span className="timestamp">{message.timestamp}</span>
                      {message.senderId === 102 && (
                        <span className="status">
                          {message.status === 'read' ? <FaCheckDouble /> : <FaCheck />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
  );
};

export default Messages; 