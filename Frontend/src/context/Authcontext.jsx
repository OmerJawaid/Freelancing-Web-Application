// Frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { DEFAULT_USER_IMAGE } from '../utils/imageUtils';

/**
 * Authentication Context
 * Provides authentication state and functions throughout the application
 */
export const AuthContext = createContext();

// Default user object properties when needed for type safety
const DEFAULT_USER = {
  id: null,
  name: null,
  email: null,
  User_Type: null,
  Image: DEFAULT_USER_IMAGE
};

/**
 * Authentication Provider Component
 * Handles user authentication state and provides login/logout functionality
 */
export const AuthProvider = ({ children }) => {
  // ===== State Management =====
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const socketRef = useRef(null);

  // Configure axios for CORS credentials
  axios.defaults.withCredentials = true;

  /**
   * Initialize authentication and socket connection
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const userData = await checkAuthStatus();
      
      // Set up socket connection if user is authenticated
      if (userData) {
        if (!socketRef.current) {
          socketRef.current = io('http://localhost:8081');
        }
        socketRef.current.emit('register', userData.id);
        // console.log("Socket registered for user:", userData.id);
      }
    };

    // Initialize auth when component mounts
    initializeAuth();
    
    // Set up periodic auth checks (every 2 minutes)
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 2 * 60 * 1000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // ===== Authentication Functions =====

  /**
   * Check if the user is authenticated with the server
   * @returns {Object|null} User data if authenticated, null otherwise
   */
  const checkAuthStatus = async () => {
    let userData = null;

    try {
      const response = await axios.get('http://localhost:8081/authentication/checkAuthentication');
      
      if (response.data.authenticated && response.data.user) {
        userData = response.data.user;

        // Ensure Image property is never null
        if (!userData.Image) {
          userData.Image = DEFAULT_USER_IMAGE;
        }

        // Update authentication state
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Clear authentication state
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }

    return userData;
  };

  /**
   * Log in a user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Object} Result object with success status and user type or error message
   */
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8081/authentication/login', {
        Email: email,
        Password: password
      }, {
        withCredentials: true
      });
      
      if (response.data.Authenticate) {
        const userData = response.data.user;
        
        // Ensure Image property is never null
        if (!userData.Image) {
          userData.Image = DEFAULT_USER_IMAGE;
        }
        
        // Store user data for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update authentication state
        setUser(userData);
        setIsAuthenticated(true);
        
        return { 
          success: true, 
          userType: userData.User_Type
        };
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

  /**
   * Log out the current user
   */
  const logout = async () => {
    try {
      await axios.post('http://localhost:8081/authentication/logout');
      
      // Clear authentication state
      setUser(null);
      setIsAuthenticated(false);
      
      // Clean up storage
      localStorage.removeItem('userEmail');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  };

  // Create the auth context value object
  const authContextValue = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};