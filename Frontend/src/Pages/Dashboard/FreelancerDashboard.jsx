import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import axios from 'axios';
import Footer from '../../Components/Footer/Footer';
import { AuthContext } from '../../context/Authcontext';
import AddGigForm from '../../components/AddGigForm/AddGigForm';

const FreelancerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [myGigs, setMyGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      console.log("Fetching gigs for user ID:", user?.Id);
      if (!user?.Id) {
        setError("User ID is missing. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8081/retrive-gigs', {
        params: { freelancer_Id: user.Id }
      });
      
      console.log("Gigs response:", response.data);
      setMyGigs(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching gigs:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server responded with error:", err.response.data);
        setError(err.response.data.message || "Server error. Please try again later.");
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received:", err.request);
        setError("No response from server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", err.message);
        setError("Failed to load your gigs. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (state) => {
    return state === 1 ? 'active' : 'paused';
  };

  const toggleGigStatus = async (gigId, currentState) => {
    try {
      const newState = currentState === 1 ? 0 : 1;
      await axios.put(`http://localhost:8081/update-gig-status`, {
        id: gigId,
        state: newState
      });
      
      // Update local state
      setMyGigs(prev => prev.map(gig => 
        gig.Id === gigId ? {...gig, State: newState} : gig
      ));
      
    } catch (err) {
      console.error("Error updating gig status:", err);
      alert("Failed to update gig status. Please try again.");
    }
  };

  const stats = {
    totalEarnings: myGigs.reduce((total, gig) => total + (gig.Earnings || 0), 0),
    activeOrders: myGigs.filter(gig => gig.State === 1).length,
    completionRate: 98,
    avgRating: 4.9
  };

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="user-profile">
            <div className="profile-image">
              <img src={user?.ProfileImage || "https://via.placeholder.com/100"} alt="Profile" />
            </div>
            <h3>{user?.Name || "Freelancer"}</h3>
          </div>
          
          <nav className="sidebar-menu">
            <ul>
              <li className={activeSection === 'dashboard' ? 'active' : ''}>
                <button onClick={() => setActiveSection('dashboard')}>
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </button>
              </li>
              <li className={activeSection === 'gigs' ? 'active' : ''}>
                <button onClick={() => setActiveSection('gigs')}>
                  <i className="fas fa-list"></i> My Gigs
                </button>
              </li>
              <li className={activeSection === 'add-gig' ? 'active' : ''}>
                <button onClick={() => setActiveSection('add-gig')}>
                  <i className="fas fa-plus"></i> Add New Gig
                </button>
              </li>
              <li className={activeSection === 'orders' ? 'active' : ''}>
                <button onClick={() => setActiveSection('orders')}>
                  <i className="fas fa-shopping-cart"></i> Orders
                </button>
              </li>
              <li className={activeSection === 'messages' ? 'active' : ''}>
                <button onClick={() => navigate('/messages')}>
                  <i className="fas fa-envelope"></i> Messages
                </button>
              </li>
              <li className={activeSection === 'settings' ? 'active' : ''}>
                <button onClick={() => setActiveSection('settings')}>
                  <i className="fas fa-cog"></i> Settings
                </button>
              </li>
            </ul>
          </nav>

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
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activeSection === 'dashboard' && (
            <div className="dashboard-overview">
              <div className="section-header">
                <h2>Dashboard Overview</h2>
              </div>
              <div className="dashboard-summary">
                <p>Welcome back! Here's an overview of your freelancing activity.</p>
                {/* Dashboard overview content would go here */}
              </div>
            </div>
          )}

          {activeSection === 'gigs' && (
            <>
          <div className="section-header">
            <h2>My Gigs</h2>
            <div className="gig-filters">
              <button className="filter-button active">All</button>
              <button className="filter-button">Active</button>
              <button className="filter-button">Paused</button>
            </div>
          </div>

              {loading ? (
                <div className="loading-indicator">Loading your gigs...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : myGigs.length === 0 ? (
                <div className="empty-state">
                  <p>You don't have any gigs yet. Create your first gig to start freelancing!</p>
                  <button 
                    className="create-gig-button" 
                    onClick={() => setActiveSection('add-gig')}
                  >
                    Create New Gig
                  </button>
                </div>
              ) : (
          <div className="gigs-grid">
                  {myGigs.map((gig) => (
              <div key={gig.Id} className="gig-card freelancer-gig">
                <div className="gig-image">
                        <img src={gig.Image || "https://via.placeholder.com/300x200"} alt={gig.Title} />
                        <div className={`status-badge ${getStatusBadgeClass(gig.State)}`}>
                          {gig.State === 1 ? 'Active' : 'Paused'}
                </div>
                </div>
                <div className="gig-details">
                  <h3 className="gig-title" title={gig.Title}>{gig.Title}</h3>
                  <p className="gig-description" title={gig.Description}>
                    {gig.Description ? 
                      (gig.Description.length > 100 
                        ? gig.Description.substring(0, 100).trim() + '...' 
                        : gig.Description)
                      : "No description available"}
                  </p>
                  <div className="gig-stats">
                    <div className="stat">
                      <span className="stat-label">Orders</span>
                            <span className="stat-value">{gig.Orders || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Views</span>
                            <span className="stat-value">{gig.Views || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Price</span>
                      <span className="stat-value">${gig.Price}</span>
                    </div>
                  </div>
                  <div className="gig-actions">
                          <button 
                            className="edit-button"
                            onClick={() => {
                              // Set edit gig logic
                              setActiveSection('edit-gig');
                              // You would also set the gig to edit in state
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="pause-button"
                            onClick={() => toggleGigStatus(gig.Id, gig.State)}
                          >
                      {gig.State === 1 ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
              )}
            </>
          )}

          {activeSection === 'add-gig' && (
            <AddGigForm 
              userId={user?.Id} 
              onGigAdded={fetchGigs}
              onCancel={() => setActiveSection('gigs')}
            />
          )}

          {activeSection === 'edit-gig' && (
            <div>Edit Gig Form will go here</div>
          )}

          {activeSection === 'orders' && (
            <div>Orders section will go here</div>
          )}

          {activeSection === 'settings' && (
            <div>Settings section will go here</div>
          )}
        </main>
      </div>
      <Footer/>
    </div>
  );
};

export default FreelancerDashboard; 