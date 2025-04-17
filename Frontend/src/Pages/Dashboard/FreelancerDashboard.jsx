import React, { useState } from 'react';
import './Dashboard.css';

const FreelancerDashboard = () => {
  const [myGigs, setMyGigs] = useState([
    {
      id: 1,
      title: "Professional Web Development",
      description: "Full-stack web development using modern technologies",
      price: 500,
      status: "active",
      orders: 5,
      views: 120,
      image: "https://via.placeholder.com/300x200"
    },
    {
      id: 2,
      title: "Mobile App Development",
      description: "Native iOS and Android app development",
      price: 800,
      status: "paused",
      orders: 3,
      views: 85,
      image: "https://via.placeholder.com/300x200"
    }
  ]);

  const stats = {
    totalEarnings: 2500,
    activeOrders: 3,
    completionRate: 98,
    avgRating: 4.9
  };

  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="nav-logo">FreelanceHub</h1>
        </div>
        <div className="nav-right">
          <div className="user-profile">
            <img src="https://via.placeholder.com/40" alt="Profile" className="profile-image" />
            <span className="username">John Freelancer</span>
          </div>
          <button className="nav-button">Messages</button>
          <button className="nav-button">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="stats-section">
            <h3>Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Earnings</span>
                <span className="stat-value">${stats.totalEarnings}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active Orders</span>
                <span className="stat-value">{stats.activeOrders}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Completion Rate</span>
                <span className="stat-value">{stats.completionRate}%</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Average Rating</span>
                <span className="stat-value">⭐ {stats.avgRating}</span>
              </div>
            </div>
          </div>

          <div className="action-section">
            <button className="create-gig-button">Create New Gig</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="section-header">
            <h2>My Gigs</h2>
            <div className="gig-filters">
              <button className="filter-button active">All</button>
              <button className="filter-button">Active</button>
              <button className="filter-button">Paused</button>
            </div>
          </div>

          <div className="gigs-grid">
            {myGigs.map((gig) => (
              <div key={gig.id} className="gig-card freelancer-gig">
                <div className="gig-image">
                  <img src={gig.Image} alt={gig.title} />
                  <div className={`status-badge ${gig.status}`}>
                    {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                  </div>
                </div>
                <div className="gig-details">
                  <h3 className="gig-title">{gig.title}</h3>
                  <p className="gig-description">{gig.description}</p>
                  <div className="gig-stats">
                    <div className="stat">
                      <span className="stat-label">Orders</span>
                      <span className="stat-value">{gig.orders}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Views</span>
                      <span className="stat-value">{gig.views}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Price</span>
                      <span className="stat-value">${gig.price}</span>
                    </div>
                  </div>
                  <div className="gig-actions">
                    <button className="edit-button">Edit</button>
                    <button className="pause-button">
                      {gig.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FreelancerDashboard; 