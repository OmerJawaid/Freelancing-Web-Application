import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import axios from 'axios';
import Footer from '../../Components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

const FreelancerDashboard = () => {
  const[gigs, changegig]=useState([]);
  const navigate = useNavigate();

  useEffect(()=>{
    async function Gig_Retrival(){
      try {
        const result = await axios.get('http://localhost:8081/gigs/retrieveGigForFreelancer', {
          params: { freelancer_Id: 19 }
        });
        if(!result.data){
          console.log("Error in getting gigs data")
        }
        console.log(result.data);
        changegig(result.data);
      } catch (error) {
        console.error("Error fetching gigs:", error);
      }
    }
    Gig_Retrival();
  }, []);

  const [myGigs, setMyGigs] = useState([
    {
      id: 1,
      title: "Professional Web Development",
      description: "Full-stack web development using modern technologies",
      price: 500,
      status: "active",
      orders: 5,
      views: 120,
      image: "https://dummyimage.com/300x200/e9ecef/495057&text=Gig+Preview"
    },
    {
      id: 2,
      title: "Mobile App Development",
      description: "Native iOS and Android app development",
      price: 800,
      status: "paused",
      orders: 3,
      views: 85,
      image: "https://dummyimage.com/300x200/e9ecef/495057&text=Gig+Preview"
    }
  ]);

  const stats = {
    totalEarnings: 2500,
    activeOrders: 3,
    completionRate: 98,
    avgRating: 4.9
  };

  // Function to toggle gig state
  const toggleGigState = async (gigId, currentState) => {
    const newState = currentState === 1 ? 0 : 1;
    try {
      const response = await axios.put(`http://localhost:8081/gigs/toggleState/${gigId}`, {
        state: newState
      });
      if (response.data.message === "Gig state updated successfully") {
        // Update the state in the local gigs array
        changegig(gigs.map(gig => 
          gig.Id === gigId ? { ...gig, State: newState } : gig
        ));
        console.log(`Gig ${gigId} state updated to ${newState}`);
      } else {
        console.error("Failed to update gig state:", response.data.message);
      }
    } catch (error) {
      console.error(`Error toggling state for gig ${gigId}:`, error);
    }
  };

  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <Navbar/>

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
            <button className="create-gig-button" onClick={() => navigate('/create-gig')}>Create New Gig</button>
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
            {gigs.map((gig) => (
              <div key={gig.Id} className="gig-card freelancer-gig">
                <div className="gig-image">
                  <img src={gig.Image} alt={gig.Title} />
                  <div className={`status-badge ${gig.State === 1 ? 'active' : 'paused'}`}>
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
                      <span className="stat-value">{gig.orders}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Views</span>
                      <span className="stat-value">{gig.Views}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Price</span>
                      <span className="stat-value">${gig.BasicPrice ? gig.BasicPrice : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="gig-actions">
                    <button 
                      className="edit-button"
                      onClick={() => navigate(`/edit-gig/${gig.Id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className={gig.State === 1 ? 'pause-button' : 'activate-button'}
                      onClick={() => toggleGigState(gig.Id, gig.State)}
                    >
                      {gig.State === 1 ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer/>
    </div>
  );
};

export default FreelancerDashboard; 