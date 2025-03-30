import React, { useState } from 'react';
import { FaUser, FaLock, FaArrowLeft, FaEnvelope, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
  const [userType, setUserType] = useState(''); // 'freelancer' or 'client'

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Sign up</h1>
          <p>New to Skillify</p>
        </div>
        
        <form className="signup-form">
          {/* User type selection */}
          <div className="user-type-container">
            <p className="user-type-label">I want to:</p>
            <div className="user-type-buttons">
              <button 
                type="button" 
                className={`user-type-btn ${userType === 'client' ? 'active' : ''}`}
                onClick={() => setUserType('client')}
              >
                Hire Talent
              </button>
              <button 
                type="button" 
                className={`user-type-btn ${userType === 'freelancer' ? 'active' : ''}`}
                onClick={() => setUserType('freelancer')}
              >
                Find Work
              </button>
            </div>
          </div>

          <div className="form-group">
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Name" 
              required 
            />
          </div>
          
          <div className="form-group">
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email" 
              required 
            />
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Password" 
              required 
            />
          </div>
          
          <button type="submit" className="signup-button">Sign up</button>
          
          <div className="remember-me">
            <label className="checkbox-container">
              <input type="checkbox" name="remember" />
              <span className="checkmark"></span>
              Remember me
            </label>
          </div>
          
          <div className="signup-divider">
            <p>access quickly</p>
          </div>
          
          <div className="social-signup">
            <button type="button" className="social-btn google-btn">Google</button>
            <button type="button" className="social-btn linkedin-btn">LinkedIn</button>
            <button type="button" className="social-btn sso-btn">SSO</button>
          </div>
          
          <div className="login-prompt">
            <p>Already have an account? <Link to="/login" className="login-link">Sign in</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup; 