// Frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure axios
  axios.defaults.withCredentials = true;

  // Initial auth check
  useEffect(() => {
    checkAuthStatus();
    
    // Update interval to 2 minutes
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8081/check-auth');
      if (response.data.authenticated) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
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
        // Update authentication state
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        return { 
          success: true, 
          userType: response.data.user.User_Type
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
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('userEmail');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
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