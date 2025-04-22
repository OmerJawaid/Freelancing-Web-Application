import React, { useContext } from 'react';
import { AuthContext } from '../../context/Authcontext';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
  const { user, isAuthenticated, logout, checkAuthStatus } = useContext(AuthContext);
  const navigate=useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>  
            <nav className="navbar">
         <div className="nav-left">
           <h1 className="nav-logo">Skillify</h1>
         </div>
         <div className="nav-right">
           <div className="user-profile">
             <img src="https://via.placeholder.com/40" alt="Profile" className="profile-image" />
             <span className="username">{user?.name || user?.email}</span>
           </div>
           <button className="nav-button">Messages</button>
           <button className="nav-button" onClick={handleLogout}>Logout</button>
         </div>
       </nav>
    </div>
  );
};

export default Navbar;