// Frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export const AuthContext = createContext();

// Default user object to prevent null reference errors
const DEFAULT_USER = {
  id: null,
  name: 'Guest',
  email: 'guest@example.com',
  User_Type: 'guest',
  Image: 'https://via.placeholder.com/40'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const socketRef = useRef(null);

  // Configure axios
  axios.defaults.withCredentials = true;

  // Initial auth check
  useEffect(() => {
    const getUserData = async () => {
      const userData = await checkAuthStatus();

      if (userData) {
        if (!socketRef.current) {
          socketRef.current = io('http://localhost:8081'); // create only once
        }
        socketRef.current.emit('register', userData.id);
        console.log("Socket registered:", userData);
      }
    };

    getUserData();
    
    // Update interval to 2 minutes
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 2 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect(); // 🔌 cleanup on unmount
        socketRef.current = null;
      }
    };

  }, []);

  const checkAuthStatus = async () => {
    let userData = null; // Ensure userData is always initialized

    try {
      const response = await axios.get('http://localhost:8081/check-auth');
      if (response.data.authenticated && response.data.user) {
        userData = response.data.user;

        // Ensure Image property is never null
        if (!userData.Image) {
          userData.Image = DEFAULT_USER.Image;
        }

        setUser(userData);
        console.log(userData);
        setIsAuthenticated(true);
      } else {
        setUser(DEFAULT_USER);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(DEFAULT_USER);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }

    return userData;
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8081/login', {
        Email: email,
        Password: password
      }, {
        withCredentials: true
      });
      
      if (response.data.Authenticate) {
        // Process user data to ensure all required fields exist
        const userData = response.data.user;
        
        // Ensure Image property is never null
        if (!userData.Image) {
          userData.Image = DEFAULT_USER.Image;
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update authentication state
        setUser(userData);
        setIsAuthenticated(true);
        
        return { 
          success: true, 
          userType: userData.User_Type
        }
      }
      
      return {
        success: false,
        message: response.data.message || 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during login'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8081/logout');
      setUser(DEFAULT_USER);
      setIsAuthenticated(false);
      localStorage.removeItem('userEmail');
      localStorage.removeItem('user'); // Clear user data from localStorage
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Provide a safe user object that never has null Image
  const safeUser = user || DEFAULT_USER;

  return (
    <AuthContext.Provider value={{ 
      user: safeUser, 
      loading, 
      isAuthenticated, 
      login, 
      logout,
      checkAuthStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};