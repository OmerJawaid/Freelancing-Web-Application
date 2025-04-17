import React, { useState } from 'react';
import { FaUser, FaLock, FaArrowLeft, FaEnvelope, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import axios from 'axios';

const Signup = () => {

  const navigate=useNavigate()
  const [userType, setUserType] = useState(''); // 'freelancer' or 'client'
  const [Name,setName]=useState('')
  const [Email,setEmail]=useState('')
  const [Password,setPassword]=useState('')
  const NameInputOnChange=(e)=>{
    setName(e.target.value)
    console.log(e.target.value);
  }
  const EmailInputOnChange=(e)=>{
    setEmail(e.target.value)
  }
  const PasswordInputOnChange=(e)=>{
    setPassword(e.target.value);
    console.log(e.target.value);
  }
  const SignupButtonOnClick=async()=>{
    const result = await axios.post("http://localhost:8081/signup", {Name:Name,Email:Email,Password:Password,User_Type:userType});
    if(result.data.Signup_Sucess){
      navigate('/login')
    }
    else
    {alert("Can't Create your Account check your information")}
  }

  

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
              onChange={NameInputOnChange}
            />
          </div>
          
          <div className="form-group">
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email" 
              required 
              onChange={EmailInputOnChange}
            />
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Password" 
              required 
              onChange={PasswordInputOnChange}
            />
          </div>
          
          <button type="submit" className="signup-button" onClick={SignupButtonOnClick}>Sign up</button>
          
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