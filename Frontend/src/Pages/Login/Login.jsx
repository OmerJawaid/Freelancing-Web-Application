
// Frontend/src/Pages/Login/Login.jsx
import React, { useState, useContext, useEffect } from "react";
import { FaUser, FaLock, FaArrowLeft, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

import { AuthContext } from "../../context/Authcontext";
import axios from 'axios'
import {toast} from 'react-toastify'



const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load remembered email if exists
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('userEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);



  // Handle navigation after successful login
  useEffect(() => {
    if (isAuthenticated && user && user.User_Type) {
      const path = user.User_Type === 'freelancer' ? '/freelancer' : '/client';
      console.log('Navigating to:', path);
      navigate(path, { replace: true }); // Use replace to prevent back navigation
    }
  }, [isAuthenticated, user, navigate]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Login Credentials are Incorrect")
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
console.log("Login result:", result); // Add this

if (result.success) {
  if (rememberMe) {
    localStorage.setItem('userEmail', formData.email);
  } else {
    localStorage.removeItem('userEmail');
  }

  console.log("Successfully Logged in");

  const path = result.userType === 'freelancer' ? '/freelancer' : '/client';
  navigate(path);
} else {
  toast.error(result.message || 'Login failed');
  console.log("Login failed:", result.message);
}

    } catch (err) {
      toast.error("An error occurred during login");
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="back-button">
            <FaArrowLeft /> Back to home
          </Link>
          <h1 className="login-logo">Skillify</h1>
        </div>
        
        <div className="login-form-container">
          <div className="login-welcome">
            <h2>Welcome Back</h2>
            <p>Log in to your account to continue your freelancing journey</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <div className="icon-container">
                  <FaUser className="input-icon" />
                </div>
                <div className="input-container">
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="Enter your email" 
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="input-with-icon">
                <div className="icon-container">
                  <FaLock className="input-icon" />
                </div>
                <div className="input-container">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="remember-me">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  name="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>
            
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
            
            <div className="login-divider">
              <span>OR</span>
            </div>
            
            <div className="social-login">
              <button type="button" className="google-button">
                <FaGoogle style={{ fontSize: "18px" }} />
                Continue with Google
              </button>
            </div>
            
            <p className="signup-prompt">
              Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;