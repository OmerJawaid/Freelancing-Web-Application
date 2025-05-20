import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/Authcontext';
import './Navbar.css';

// Import icons
import { 
  FaCog,        // Settings
  FaEnvelope,   // Messages
  FaSignOutAlt, // Logout
  FaHome,       // Home/Dashboard
  FaSignInAlt,  // Login
  FaUserPlus    // Sign Up
} from 'react-icons/fa';

// Default image to use when user profile image is not available
const DEFAULT_USER_IMAGE = "https://dummyimage.com/100/e9ecef/495057&text=User";

/**
 * Navbar component that adapts based on authentication state
 * Shows different navigation options for logged-in vs non-logged-in users
 */
const Navbar = () => {
  // Authentication context
  const { user, isAuthenticated, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  
  // Image and UI state
  const [imgSrc, setImgSrc] = useState(DEFAULT_USER_IMAGE);
  const [imgError, setImgError] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // ===== Navigation handlers =====
  
  /**
   * Navigate to the appropriate dashboard based on user type
   */
  const handleDashboardClick = () => {
    if (isAuthenticated && user?.User_Type) {
      const path = user.User_Type === 'freelancer' ? '/freelancer' : '/client';
      navigate(path);
    }
  };

  /**
   * Navigate to settings page
   */
  const handleOpenSettings = () => {
    navigate('/settings');
  };

  /**
   * Handle logo click - go to dashboard if logged in, home page if not
   */
  const handleLogoClick = (e) => {
    e.preventDefault();
    
    if (isAuthenticated && user) {
      const path = user.User_Type === 'freelancer' ? '/freelancer' : '/client';
      navigate(path);
    } else {
      navigate('/');
    }
  };

  /**
   * Handle logout and redirect to login page
   */
  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  // ===== Image handling =====
  
  /**
   * Resolve the user profile image URL based on different path formats
   */
  useEffect(() => {
    // Default to fallback image right away to prevent empty string src
    setImgSrc(DEFAULT_USER_IMAGE);
    
    if (!user || !user.Image) {
      setDebugInfo('No user image found, using default image');
      return;
    }
    
    let imageUrl;
    const { Image } = user;
    
    // Determine the correct URL based on image path format
    if (Image.startsWith('http')) {
      // Already a full URL
      imageUrl = Image;
    } else if (Image.startsWith('/src/assets/')) {
      // Frontend static assets
      imageUrl = `${window.location.origin}${Image.replace('/src', '')}`;
    } else if (Image.startsWith('/public/')) {
      // Backend public directory
      imageUrl = `http://localhost:8081${Image}`;
    } else if (Image.startsWith('/profileImages/')) {
      // Legacy format
      imageUrl = `http://localhost:8081/public${Image}`;
    } else if (Image.startsWith('/assets/')) {
      // Frontend assets
      imageUrl = `${window.location.origin}${Image}`;
    } else {
      // Fallback to backend path
      imageUrl = `http://localhost:8081${Image.startsWith('/') ? '' : '/'}${Image}`;
    }
    
    setDebugInfo(`User ID: ${user.id}, Image path: ${Image}, Resolved URL: ${imageUrl}`);
    setImgSrc(imageUrl);
    setImgError(false);
  }, [user]);

  /**
   * Handle image loading errors
   */
  const handleImageError = () => {
    console.log('Image failed to load, using default:', imgSrc);
    setImgError(true);
    setImgSrc(DEFAULT_USER_IMAGE);
    setDebugInfo(`Image failed to load: ${imgSrc}, using default placeholder`);
  };

  // ===== Render components =====
  
  /**
   * Render authenticated user navigation
   */
  const renderAuthenticatedNav = () => (
    <>
      <div className="user-profile">
        <img 
          src={imgSrc || DEFAULT_USER_IMAGE}
          alt="Profile" 
          className="profile-image" 
          onError={handleImageError}
        />
        <span className="username">{user.name || user.email || "User"}</span>
      </div>
      <button className="nav-button dashboard-button" onClick={handleDashboardClick}>
        <FaHome className="nav-icon" /> {user.User_Type === 'client' ? 'Home' : 'Dashboard'}
      </button>
      <button className="nav-button" onClick={() => navigate('/messages')}>
        <FaEnvelope className="nav-icon" /> Messages
      </button>
      <button className="nav-button settings-button" onClick={handleOpenSettings}>
        <FaCog className="nav-icon" /> Settings
      </button>
      <button className="nav-button logout-button" onClick={handleLogout}>
        <FaSignOutAlt className="nav-icon" /> Logout
      </button>
    </>
  );

  /**
   * Render non-authenticated user navigation
   */
  const renderUnauthenticatedNav = () => (
    <>
      <button className="nav-button login-button" onClick={() => navigate('/login')}>
        <FaSignInAlt className="nav-icon" /> Login
      </button>
      <button className="nav-button signup-button" onClick={() => navigate('/signup')}>
        <FaUserPlus className="nav-icon" /> Sign Up
      </button>
    </>
  );

  return (
    <div>  
      <nav className="navbar">
        <div className="nav-left">
          <a href="#" onClick={handleLogoClick} className="nav-logo">Skillify</a>
        </div>
        <div className="nav-right">
          {isAuthenticated && user 
            ? renderAuthenticatedNav() 
            : renderUnauthenticatedNav()
          }
        </div>
      </nav>
      
      {/* Debug info panel */}
      <div style={{position: 'fixed', bottom: 0, background: 'white', padding: '5px', fontSize: '10px', width: '100%', zIndex: 9999}}>
        {debugInfo}
      </div>
    </div>
  );
};

export default Navbar;