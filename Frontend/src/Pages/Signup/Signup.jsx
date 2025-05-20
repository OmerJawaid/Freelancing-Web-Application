import React, { useState, useRef } from 'react';
import { FaUser, FaLock, FaArrowLeft, FaEnvelope, FaUpload, FaImage } from "react-icons/fa";
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
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const validateEmail = (email) => {
    const emailcheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailcheck.test(email);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
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
      
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('Name', name);
      formData.append('Email', email);
      formData.append('Password', password);
      formData.append('User_Type', userType);
      
      // Only append bio if user is a freelancer
      if (userType === 'freelancer' && bio) {
        formData.append('Bio', bio);
      }
      
      // Append profile image if available
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const result = await axios.post("http://localhost:8081/authentication/signup", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
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

          {/* Profile Image Upload */}
          <div className="profile-upload-container">
            <div 
              className="profile-image-preview" 
              onClick={triggerFileInput}
              style={{ backgroundImage: previewImage ? `url(${previewImage})` : 'none' }}
            >
              {!previewImage && <FaImage className="upload-icon" />}
            </div>
            <button 
              type="button" 
              className="upload-button" 
              onClick={triggerFileInput}
            >
              <FaUpload /> Upload Photo
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
            />
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

          {/* Bio textarea - only shown if user type is freelancer */}
          {userType === 'freelancer' && (
            <div className="form-group bio-group">
              <textarea 
                id="bio" 
                name="bio" 
                placeholder="Tell us about yourself and your skills (optional)" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          )}
          
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
          
          <div className="login-prompt">
            <p>Already have an account? <Link to="/login" className="login-link">Sign in</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;                                                 