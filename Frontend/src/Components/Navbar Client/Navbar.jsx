import React, { useContext } from 'react';
import { AuthContext } from '../../context/Authcontext';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
  const { user } = useContext(AuthContext);
  
  return (
    <div>  
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="nav-logo">Skillify</h1>
        </div>
        <div className="nav-right">
          <div className="user-profile">
            <img 
              src={user?.Image || "https://via.placeholder.com/40"} 
              alt="Profile" 
              className="profile-image" 
            />
            <span className="username">{user?.name || user?.email}</span>
          </div>
          <button className="nav-button">Messages</button>
          <button className="nav-button" onClick={onLogout}>Logout</button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;