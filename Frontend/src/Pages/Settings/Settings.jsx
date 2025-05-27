import React, { useState, useEffect, useContext } from 'react';
import './Settings.css';
import { AuthContext } from '../../context/Authcontext';
import Navbar from '../../Components/Navbar Client/Navbar';
import Footer from '../../Components/Footer/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, checkAuthStatus } = useContext(AuthContext);
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '', // Only for freelancers
    image: null
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        image: null
      });
    }
  }, [user]);

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileForm(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    setProfileLoading(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('Name', profileForm.name);
      
      // Only include bio if user is a freelancer
      if (user.User_Type === 'freelancer') {
        formData.append('Bio', profileForm.bio);
      }
      
      // Only include image if one was selected
      if (profileForm.image) {
        formData.append('profileImage', profileForm.image);
      }

      // Send user type and ID for the backend to know which table to update
      formData.append('User_Type', user.User_Type);
      formData.append('Id', user.id);

      const response = await axios.put(
        'https://freelancing-web-application-production.up.railway.app/profile/updateProfile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully");
        
        // Refresh user data in context
        await checkAuthStatus();
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "An error occurred while updating your profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      toast.error("You must be logged in to change your password");
      return;
    }

    // Validate password
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await axios.put(
        'https://freelancing-web-application-production.up.railway.app/profile/updatePassword',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          userId: user.id
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Password updated successfully");
        
        // Clear password form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.response?.data?.message || "An error occurred while updating your password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <Navbar />
      
      <div className="settings-container">
        <h1 className="settings-title">Account Settings</h1>
        
        <div className="settings-sections">
          {/* Profile Settings */}
          <section className="settings-section">
            <h2>Profile Information</h2>
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                  placeholder="Your name"
                />
              </div>
              
              {/* Bio - Only for freelancers */}
              {user && user.User_Type === 'freelancer' && (
                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell clients about yourself and your expertise"
                    rows={4}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="image">Profile Image</label>
                <div className="image-upload-container">
                  <div className="current-image">
                    {previewImage ? (
                      <img src={previewImage} alt="Profile Preview" className="profile-preview" />
                    ) : user && user.Image ? (
                      <img 
                        src={user.Image.startsWith('http') 
                          ? user.Image 
                          : `https://freelancing-web-application-production.up.railway.app${user.Image.startsWith('/') ? '' : '/'}${user.Image}`} 
                        alt="Current Profile" 
                        className="profile-preview"
                        onError={(e) => { e.target.src = "https://dummyimage.com/100/e9ecef/495057&text=User" }}
                      />
                    ) : (
                      <div className="no-image">No image selected</div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="file-input"
                  />
                  <label htmlFor="image" className="file-input-label">Choose a file</label>
                </div>
              </div>
              
              <button type="submit" className="submit-button" disabled={profileLoading}>
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </section>
          
          {/* Password Change */}
          <section className="settings-section">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter current password"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              
              <button type="submit" className="submit-button" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Settings; 