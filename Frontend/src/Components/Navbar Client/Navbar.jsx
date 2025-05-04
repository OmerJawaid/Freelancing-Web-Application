import React, { useContext } from 'react';
import { AuthContext } from '../../context/Authcontext';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

// Default values if needed
const DEFAULT_USER = {
  name: 'Guest',
  email: 'guest@example.com',
  Image: 'https://media-hosting.imagekit.io/86a88d09aae2472d/download.png?Expires=1839859669&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=0WnB0Iv-RFGZawC~X5GWgn2GwyN7SSljbZHhScYVtt23khRq2V6ra-E-donYyO3RZxkvkqdkDxJqyEkt9cBns4HndW1X5M~jMvG2PmG5rkjdEsatBTTlARuddXC5uTu7Gcp~rojvToPaS5TkGszf7jS1z0AEcZvlhmIXtRNIfx1LQgxnv1yda9rstMn~-eZzHS0vzeyVIGTj~4HuqOgxyozVjshUBM-gyVft3VmZ-b2dN3AZ-VfccVnieynhgnqTRMhT5MYdifXKyiT4wctoFReBsGQTAeVqaGGrNcPzk3hFYxCeNLwLcZToQopHx0ydw7s2IK-zFYFKsPqWRHga4Q__'
};

const Navbar = ({ onLogout }) => {
  // Get auth context with safe default values
  const { user = DEFAULT_USER, isAuthenticated, logout, checkAuthStatus } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  // Create a safe user object that always exists and has all required properties
  const safeUser = {
    ...DEFAULT_USER,
    ...(user || {}), // Merge with actual user data if it exists
    // Ensure Image is never null
    Image: (user && user.Image) || DEFAULT_USER.Image
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Navigate anyway as fallback
      navigate('/login');
    }
  };

  // Ensure we have something to render even if context is missing
  return (
    <div>  
      <nav className="navbar">
        <div className="nav-left">
          <NavLink to='/'><h1 className="nav-logo">Skillify</h1></NavLink>
        </div>
        <div className="nav-right">
          <div className="user-profile">
            <img 
              src={safeUser.Image} 
              alt="Profile" 
              className="profile-image" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_USER.Image;
              }}
            />
            <span className="username">{safeUser.name || safeUser.email || "Guest"}</span>
          </div>
          <button className="nav-button">Messages</button>
          <button className="nav-button" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;