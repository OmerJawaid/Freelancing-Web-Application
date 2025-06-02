import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { IoMdNotificationsOutline, IoMdNotifications } from 'react-icons/io';
import { AuthContext } from '../../context/Authcontext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Notofication.css';

const NotificationComponent = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notificationRef = useRef(null);
  const socket = useRef(null);
  const navigate = useNavigate();

  // Function to format time for notifications
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return notificationTime.toLocaleDateString();
  };

  // Function to fetch notifications
  const fetchNotifications = async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching notifications for user ${user.id}`);
      const url = `http://localhost:8081/notifications/user/${user.id}`;
      console.log(`Request URL: ${url}`);
      
      const response = await axios.get(url, {
        withCredentials: true
      });
      
      console.log('Notifications response:', response.data);
      
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
        // Count unread notifications
        const unread = response.data.filter(notification => !notification.Is_Read).length;
        setUnreadCount(unread);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again later.');
      setNotifications([]);
      setUnreadCount(0);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch unread count only
  const fetchUnreadCount = async () => {
    if (!user || !user.id) return;
    
    try {
      console.log(`Fetching unread count for user ${user.id}`);
      const url = `http://localhost:8081/notifications/unread/${user.id}`;
      console.log(`Request URL: ${url}`);
      
      const response = await axios.get(url, {
        withCredentials: true
      });
      
      console.log('Unread count response:', response.data);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Keep the current unread count
    }
  };

  // Function to mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8081/notifications/read/${notificationId}`, {}, {
        withCredentials: true
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.Id === notificationId 
            ? { ...notification, Is_Read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Update UI anyway for better UX
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.Id === notificationId 
            ? { ...notification, Is_Read: true } 
            : notification
        )
      );
      
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || !user.id) return;
    
    try {
      await axios.put(`http://localhost:8081/notifications/read-all/${user.id}`, {}, {
        withCredentials: true
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, Is_Read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      // Update UI anyway for better UX
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, Is_Read: true }))
      );
      
      setUnreadCount(0);
    }
  };

  // Function to handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark notification as read
    await markAsRead(notification.Id);
    
    // Navigate based on notification type
    switch (notification.Type) {
      case 'message':
        navigate(`/messages?conversation=${notification.Related_Id}`);
        break;
      case 'order':
      case 'order_work':
      case 'order_approved':
      case 'order_revision':
        if (user.User_Type === 'client') {
          navigate('/client-orders');
        } else {
          navigate('/freelancer-orders');
        }
        break;
      default:
        // Default navigation based on user type
        if (user.User_Type === 'client') {
          navigate('/client-dashboard');
        } else {
          navigate('/freelancer-dashboard');
        }
    }
    
    // Close notification panel
    setIsOpen(false);
  };

  // Handle click outside to close notification panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize socket connection and fetch notifications on component mount
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Fetch initial notifications
    fetchNotifications();
    
    // Set up socket connection with proper configuration
    try {
      // Disconnect existing socket if it exists
      if (socket.current) {
        socket.current.disconnect();
      }
      
      // Connect with proper transport options
      socket.current = io('http://localhost:8081', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });
      
      console.log('Socket connection attempt initiated');
      
      // Handle connection events
      socket.current.on('connect', () => {
        console.log('Socket connected successfully with ID:', socket.current.id);
        
        // Join user's room for personalized notifications
        socket.current.emit('join', { userId: user.id });
        console.log('Join event emitted for user:', user.id);
      });
      
      socket.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      // Listen for new notifications with proper event handling
      socket.current.on('new_notification', (data) => {
        console.log('New notification received:', data);
        
        // Add the new notification to the state with proper ID handling
        setNotifications(prev => [{
          Id: data.id || Date.now(), // Use server-provided ID if available
          User_Id: user.id,
          Type: data.type,
          Title: data.title,
          Message: data.message,
          Related_Id: data.relatedId,
          Is_Read: false,
          Created_At: data.createdAt || new Date().toISOString()
        }, ...prev]);
        
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Play notification sound
        try {
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(err => console.error('Error playing notification sound:', err));
        } catch (err) {
          console.error('Error with notification sound:', err);
        }
      });
    } catch (err) {
      console.error('Error setting up socket connection:', err);
    }
    
    // Clean up socket connection on unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user]);

  // Periodically refresh unread count
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, [user]);

  if (!user) return null;

  return (
    <div className="notification-component" ref={notificationRef}>
      <div className="notification-icon" onClick={() => setIsOpen(!isOpen)}>
        {unreadCount > 0 ? (
          <>
            <IoMdNotifications />
            <span className="notification-badge">{unreadCount}</span>
          </>
        ) : (
          <IoMdNotificationsOutline />
        )}
      </div>
      
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {loading ? (
              <div className="loading">Loading notifications...</div>
            ) : error ? (
              <div className="error">
                <p>{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.Id} 
                  className={`notification-item ${!notification.Is_Read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <h4>{notification.Title}</h4>
                    <p>{notification.Message}</p>
                    <span className="notification-time">
                      {formatNotificationTime(notification.Created_At)}
                    </span>
                  </div>
                  {!notification.Is_Read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;