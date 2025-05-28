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

  axios.defaults.withCredentials = true;
  
  // CRITICAL FIX: Properly configure axios for all requests
  useEffect(() => {
    // Set a default Authorization header on axios itself
    // This ensures ALL axios requests will include this header without requiring interceptors
    axios.defaults.withCredentials = true;
    
    // Setup global request interceptor for all axios requests
    const interceptor = axios.interceptors.request.use(config => {
      // Get authentication token from all possible sources
      let token = null;
      
      // Try sessionStorage first
      const sessionToken = sessionStorage.getItem('authToken');
      if (sessionToken) {
        token = sessionToken;
      } else {
        // If not in sessionStorage, check localStorage
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData && userData.token) {
              token = userData.token;
              // Update sessionStorage for future requests
              sessionStorage.setItem('authToken', token);
            }
          }
        } catch (error) {
          console.error('Error parsing stored user data', error);
        }
      }
      
      // ALWAYS log the entire request for debugging
      console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: !!token,
        contentType: config.headers['Content-Type'] || config.headers.get?.('Content-Type') || 'not set',
        hasData: !!config.data
      });
      
      // Set Authorization header if we have a token
      if (token) {
        // Use this format for setting headers - more reliable
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    }, error => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    });

    // Response interceptor to handle authentication errors
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // Check for authentication errors
        if (error.response && error.response.status === 401) {
          console.error('Authentication failed:', error.response.data);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  /**
   * Initialize authentication and socket connection
   */
  useEffect(() => {
    const initializeAuth = async () => {
      // First try to restore from localStorage if available
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Set up socket with stored user data
          if (!socketRef.current) {
            socketRef.current = io('https://freelancing-web-application-production.up.railway.app');
            socketRef.current.emit('register', parsedUser.id);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
        }
      }
      
      // Then verify with the server
      const userData = await checkAuthStatus();
      
      // Set up socket connection if user is authenticated from server
      if (userData) {
        if (!socketRef.current) {
          socketRef.current = io('https://freelancing-web-application-production.up.railway.app');
          socketRef.current.emit('register', userData.id);
        }
      }
    };

    // Initialize auth when component mounts
    initializeAuth();
    
    // Set up periodic auth checks (every 2 minutes)
    const interval = setInterval(() => {
      // Don't log out the user if the server is temporarily unavailable
      checkAuthStatus().catch(error => {
        console.error('Auth check failed, maintaining current session:', error);
      });
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
      const response = await axios.get('https://freelancing-web-application-production.up.railway.app/authentication/checkAuthentication');
      
      if (response.data.authenticated && response.data.user) {
        userData = response.data.user;

        // Ensure Image property is never null
        if (!userData.Image) {
          userData.Image = DEFAULT_USER_IMAGE;
        }

        // Update authentication state
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store the latest user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Check if we have a stored user before clearing authentication
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          // If server session is lost but we have local storage data,
          // try to maintain the user experience instead of logging them out
          console.log('Server session expired but using stored credentials');
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            userData = parsedUser;
            return userData; // Return early to maintain session
          } catch (parseError) {
            console.error('Error parsing stored user:', parseError);
          }
        }
        
        // If no stored user or parsing failed, clear authentication state
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      
      // On network errors, check localStorage before logging out
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          userData = parsedUser;
          console.log('Network error, using stored credentials');
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
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
      const response = await axios.post('https://freelancing-web-application-production.up.railway.app/authentication/login', {
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
        
        // Store the token separately in sessionStorage for API calls
        if (response.data.token) {
          // Store token in sessionStorage for API calls
          sessionStorage.setItem('authToken', response.data.token);
          console.log('Token stored in sessionStorage');
          
          // Also add to user data for backward compatibility
          userData.token = response.data.token;
        }
        
        // Store user data for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User data stored in localStorage');
        
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
      await axios.post('https://freelancing-web-application-production.up.railway.app/authentication/logout');
      
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