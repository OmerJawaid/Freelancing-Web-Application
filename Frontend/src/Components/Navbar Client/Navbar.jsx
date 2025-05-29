import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/Authcontext';
import NotificationComponent from '../../Pages/Notification/Notification';
import './Navbar.css';


// Import icons
import { 
  FaCog,        // Settings
  FaEnvelope,   // Messages
  FaSignOutAlt, // Logout
  FaHome,       // Home/Dashboard
  FaSignInAlt,  // Login
  FaUserPlus,   // Sign Up
  FaShoppingBag, // Orders
  FaUser,       // User profile
  FaListAlt     // My Gigs
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Handle click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ===== Navigation handlers =====
  
  /**
   * Navigate to the appropriate dashboard based on user type
   */
  const handleDashboardClick = () => {
    if (isAuthenticated && user?.User_Type) {
      const path = user.User_Type === 'freelancer' ? '/freelancer-dashboard' : '/client-dashboard';
      navigate(path);
    }
  };

  /**
   * Navigate to the appropriate orders page based on user type
   */
  const handleOrdersClick = () => {
    if (isAuthenticated && user?.User_Type) {
      const path = user.User_Type === 'freelancer' ? '/freelancer-orders' : '/client-orders';
      navigate(path);
    }
  };

  //Navigate to settings page
  const handleOpenSettings = () => {
    navigate('/settings');
  };

  //Handle logo click - go to dashboard if logged in, home page if not
  const handleLogoClick = (e) => {
    e.preventDefault();
    
    if (isAuthenticated && user) {
      const path = user.User_Type === 'freelancer' ? '/freelancer-dashboard' : '/client-dashboard';
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

  /**
   * Toggle profile dropdown
   */
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // ===== Image handling =====
  
  //Resolve the user profile image URL based on different path formats
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
      <button className="nav-button dashboard-button" onClick={handleDashboardClick}>
        <FaHome className="nav-icon" /> {user.User_Type === 'client' ? 'Home' : 'Dashboard'}
      </button>
      <button className="nav-button" onClick={() => navigate('/messages')}>
        <FaEnvelope className="nav-icon" /> Messages
      </button>
      <button className="nav-button" onClick={handleOrdersClick}>
        <FaShoppingBag className="nav-icon" /> {user.User_Type === 'client' ? 'My Orders' : 'Manage Orders'}
      </button>
      {user.User_Type === 'freelancer' && (
        <button className="nav-button" onClick={() => navigate('/my-gigs')}>
          <FaListAlt className="nav-icon" /> My Gigs
        </button>
      )}
      <button className="nav-button icon-only" onClick={handleOpenSettings} title="Settings">
        <FaCog className="nav-icon" />
      </button>
      <NotificationComponent />
      <div className="profile-dropdown" ref={profileRef}>
        <div className="profile-trigger" onClick={toggleProfile}>
          <img 
            src={imgSrc || DEFAULT_USER_IMAGE}
            alt="Profile" 
            className="profile-image" 
            onError={handleImageError}
          />
        </div>
        {isProfileOpen && (
          <div className="profile-menu">
            <div className="profile-header">
              <img 
                src={imgSrc || DEFAULT_USER_IMAGE}
                alt="Profile" 
                className="profile-image-large" 
                onError={handleImageError}
              />
              <div className="profile-info">
                <span className="profile-name">{user.name || user.email || "User"}</span>
                <span className="profile-email">{user.email}</span>
              </div>
            </div>
            <div className="profile-menu-items">
              <button className="profile-menu-item" onClick={handleLogout}>
                <FaSignOutAlt className="menu-icon" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
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
        <div className="nav-center">
          {isAuthenticated && user && (
            <>
              <button className="nav-button dashboard-button" onClick={handleDashboardClick}>
                <FaHome className="nav-icon" /> {user.User_Type === 'client' ? 'Home' : 'Dashboard'}
              </button>
              <button className="nav-button" onClick={() => navigate('/messages')}>
                <FaEnvelope className="nav-icon" /> Messages
              </button>
              <button className="nav-button" onClick={handleOrdersClick}>
                <FaShoppingBag className="nav-icon" /> {user.User_Type === 'client' ? 'My Orders' : 'Manage Orders'}
              </button>
              {user.User_Type === 'freelancer' && (
                <button className="nav-button" onClick={() => navigate('/my-gigs')}>
                  <FaListAlt className="nav-icon" /> My Gigs
                </button>
              )}
            </>
          )}
        </div>
        <div className="nav-right">
          {isAuthenticated && user ? (
            <>
              <button className="nav-button icon-only" onClick={handleOpenSettings} title="Settings">
                <FaCog className="nav-icon" />
              </button>
              <NotificationComponent />
              <div className="profile-dropdown" ref={profileRef}>
                <div className="profile-trigger" onClick={toggleProfile}>
                  <img 
                    src={imgSrc || DEFAULT_USER_IMAGE}
                    alt="Profile" 
                    className="profile-image" 
                    onError={handleImageError}
                  />
                </div>
                {isProfileOpen && (
                  <div className="profile-menu">
                    <div className="profile-header">
                      <img 
                        src={imgSrc || DEFAULT_USER_IMAGE}
                        alt="Profile" 
                        className="profile-image-large" 
                        onError={handleImageError}
                      />
                      <div className="profile-info">
                        <span className="profile-name">{user.name || user.email || "User"}</span>
                        <span className="profile-email">{user.email}</span>
                      </div>
                    </div>
                    <div className="profile-menu-items">
                      <button className="profile-menu-item" onClick={handleLogout}>
                        <FaSignOutAlt className="menu-icon" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="nav-button login-button" onClick={() => navigate('/login')}>
                <FaSignInAlt className="nav-icon" /> Login
              </button>
              <button className="nav-button signup-button" onClick={() => navigate('/signup')}>
                <FaUserPlus className="nav-icon" /> Sign Up
              </button>
            </>
          )}
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