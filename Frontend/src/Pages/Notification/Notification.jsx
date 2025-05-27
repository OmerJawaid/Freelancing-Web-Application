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
      const url = `https://freelancing-web-application-production.up.railway.app/notifications/user/${user.id}`;
      console.log(`Request URL: ${url}`);
      
      const response = await axios.get(url, {
        withCredentials: true
      });
      
      console.log('Notifications response:', response.data);
      
      if (Array.isArray(response.data)) {
        // Sort notifications: unread first, then by date
        const sortedNotifications = response.data.sort((a, b) => {
          if (a.Is_Read !== b.Is_Read) {
            return a.Is_Read ? 1 : -1; // Unread first
          }
          return new Date(b.Created_At) - new Date(a.Created_At);
        });
        
        setNotifications(sortedNotifications);
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
      const url = `https://freelancing-web-application-production.up.railway.app/notifications/unread/${user.id}`;
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
      await axios.put(`https://freelancing-web-application-production.up.railway.app/notifications/read/${notificationId}`, {}, {
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
      await axios.put(`https://freelancing-web-application-production.up.railway.app/notifications/read-all/${user.id}`, {}, {
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
    
    // Set up socket connection
    try {
      socket.current = io('https://freelancing-web-application-production.up.railway.app', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });
      
      // Subscribe to notifications
      socket.current.emit('subscribe_to_notifications', user.id);
      
      // Listen for new notifications
      socket.current.on('new_notification', (data) => {
        console.log('New notification received:', data);
        
        // Create notification object
        const newNotification = {
          Id: Date.now(), // Temporary ID until refresh
          User_Id: user.id,
          Type: data.type,
          Title: data.title,
          Message: data.message,
          Related_Id: data.relatedId,
          Is_Read: false,
          Created_At: new Date().toISOString()
        };

        // Add to notifications state
        setNotifications(prev => {
          const updatedNotifications = [newNotification, ...prev];
          return updatedNotifications.sort((a, b) => {
            if (a.Is_Read !== b.Is_Read) {
              return a.Is_Read ? 1 : -1;
            }
            return new Date(b.Created_At) - new Date(a.Created_At);
          });
        });
        
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Acknowledge receipt
        socket.current.emit('notification_received', {
          userId: user.id,
          notificationId: newNotification.Id
        });
        
        // Play notification sound and show browser notification
        try {
          // Play sound
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(err => console.error('Error playing notification sound:', err));
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(data.title, {
              body: data.message,
              icon: '/notification-icon.png'
            });
          }
        } catch (err) {
          console.error('Error with notification feedback:', err);
        }
      });

      // Handle socket connection errors
      socket.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Unable to connect to notification service');
      });

      // Handle socket disconnection
      socket.current.on('disconnect', () => {
        console.log('Socket disconnected, attempting to reconnect...');
      });

    } catch (err) {
      console.error('Error setting up socket connection:', err);
      setError('Failed to initialize notification service');
    }
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Clean up socket connection on unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user]);

  // Refresh notifications periodically and after window focus
  useEffect(() => {
    if (!user || !user.id) return;

    // Refresh when window gains focus
    const handleFocus = () => {
      fetchNotifications();
    };

    window.addEventListener('focus', handleFocus);

    // Periodic refresh every 30 seconds when window is active
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchUnreadCount();
      }
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
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