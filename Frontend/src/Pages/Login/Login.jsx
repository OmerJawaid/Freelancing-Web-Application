import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaArrowLeft, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Login.css";
import axios from 'axios'
import {toast} from 'react-toastify'
import { useNavigate } from "react-router-dom";


const Login = () => {
  const navigate=useNavigate()

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  const handleEmailChange =(e)=>{
    
    setEmail(e.target.value);
    console.log(e.target.value)
  }
  const handlePasswordChange=(e)=>{
    setPassword(e.target.value);
    console.log(e.target.value)
  }

  const LoginButton=async()=>{
    try{
      console.log(email+" "+password)
      const authentication_responce=await axios.post("http://localhost:8081/login", {email:email, password:password});
      
      if(authentication_responce.data.Authenticate){
      console.log("Sucessfully Logged in");
      navigate('/client');
      } 
      else
      {
        toast.error('Failed to Logged in')
        console.log("Failed to Logged in")
      }
    }
    catch(err){
      console.log("Error in Logging in")
    }
  }
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
                  onChange={handleEmailChange} 
                />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
                <a href="/forgot-password" className="forgot-password">Forgot password?</a>
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
      onChange={handlePasswordChange}
    />
  </div>
</div>
            </div>
            
            <div className="remember-me">
              <label className="checkbox-container">
                <input type="checkbox" name="remember" />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>
            
            <button type="button" className="login-button" onClick={LoginButton}>Log In</button>
            
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
