import React, { useState } from 'react';
import { FaUser, FaLock, FaArrowLeft, FaEnvelope, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import axios from 'axios';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(''); // 'freelancer' or 'client'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailcheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailcheck.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate user type
    if (!userType) {
      toast.error('Please select whether you want to hire talent or find work');
      return;
    }

    // Validate name
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate password
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const result = await axios.post("http://localhost:8081/signup", {
        Name: name,
        Email: email,
        Password: password,
        User_Type: userType
      });

      if (result.data.Signup_Sucess) {
        toast.success('Account created successfully! Redirecting to login...');
        // Add a delay before navigation to allow the success toast to be visible
        setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: { 
              fromSignup: true,
              email: email // Pass the email to pre-fill the login form
            }
          });
        }, 1500); // 1.5 second delay
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Sign up</h1>
          <p>New to Skillify</p>
        </div>
        
        <form className="signup-form" onSubmit={handleSubmit}>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            className="signup-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
          
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