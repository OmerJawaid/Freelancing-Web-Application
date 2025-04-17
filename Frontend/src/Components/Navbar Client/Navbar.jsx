import React from 'react'
import'./Navbar.css'

const Navbar = () => {
  return (
    <div>  
        <nav className="navbar">
    <div className="nav-left">
      <h1 className="nav-logo">FreelanceHub</h1>
    </div>
    <div className="nav-right">
      <div className="user-profile">
        <img src="https://via.placeholder.com/40" alt="Profile" className="profile-image" />
        <span className="username">John Client</span>
      </div>
      <button className="nav-button">Messages</button>
      <button className="nav-button">Logout</button>
    </div>
  </nav>
  </div>
  )
}

export default Navbar