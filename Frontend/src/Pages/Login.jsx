import React from "react";
import { FaUser, FaLock, FaArrowLeft, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
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
          
          <form className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
                <a href="/forgot-password" className="forgot-password">Forgot password?</a>
              </div>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  required 
                />
              </div>
            </div>
            
            <div className="remember-me">
              <label className="checkbox-container">
                <input type="checkbox" name="remember" />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>
            
            <button type="submit" className="login-button">Log In</button>
            
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
