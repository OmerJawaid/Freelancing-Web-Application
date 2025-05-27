import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import Navbar from '../../Components/Navbar Client/Navbar';
import WorkExperience from '../../Components/WorkExperience/WorkExperience';
import './FreelancerProfile.css';
import { getImageUrl, DEFAULT_USER_IMAGE } from '../../utils/imageUtils';

const FreelancerProfile = () => {
  const { id } = useParams(); // Changed from freelancerId to id to match the route parameter
  const navigate = useNavigate();
  const freelancerId = id; // Keep freelancerId as a variable for backward compatibility
  const [freelancer, setFreelancer] = useState(null);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Fetch the logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(user);
    
    // Check if viewing own profile
    if (user && freelancerId && user.id.toString() === freelancerId.toString()) {
      setIsOwnProfile(true);
    }
  }, [freelancerId]);

  // Fetch freelancer data
  useEffect(() => {
    const fetchFreelancerData = async () => {
      if (!freelancerId) return;
      
      setLoading(true);
      try {
        // Fetch freelancer profile
        const profileResponse = await axios.get(
          `/profile/freelancer/${freelancerId}`,
          { withCredentials: true }
        );
        
        if (profileResponse.data) {
          setFreelancer(profileResponse.data);
        } else {
          setError('Freelancer not found');
        }
        
        // Fetch completed orders for this freelancer
        const ordersResponse = await axios.get(
          `/orders/freelancer-completed`,
          { 
            params: { freelancerId },
            withCredentials: true 
          }
        );
        
        if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
          setCompletedOrders(ordersResponse.data);
        }
      } catch (error) {
        console.error('Error fetching freelancer data:', error);
        setError('Failed to load freelancer profile');
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerData();
  }, [freelancerId]);

  // Function to render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="star half-filled" />);
      } else {
        stars.push(<FaRegStar key={i} className="star empty" />);
      }
    }
    
    return (
      <div className="star-rating">
        {stars}
        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle contact freelancer
  const handleContactFreelancer = () => {
    if (!currentUser) {
      // Redirect to login if not logged in
      navigate('/login', { state: { redirectTo: `/freelancer/${freelancerId}` } });
      return;
    }
    
    // Create conversation and redirect to messages
    navigate(`/messages?newConversation=${freelancerId}`);
  };

  // Handle view gigs
  const handleViewGigs = () => {
    navigate(`/search?freelancer=${freelancerId}`);
  };

  if (loading) {
    return (
      <div className="freelancer-profile-page">
        <Navbar />
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading freelancer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="freelancer-profile-page">
        <Navbar />
        <div className="profile-error">
          <h2>Error</h2>
          <p>{error || 'Failed to load freelancer profile'}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="freelancer-profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-image">
            <img 
              src={getImageUrl(freelancer.Image, DEFAULT_USER_IMAGE)} 
              alt={freelancer.Name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_USER_IMAGE;
              }}
            />
          </div>
          
          <div className="profile-info">
            <h1>{freelancer.Name}</h1>
            
            {freelancer.Rating > 0 && (
              <div className="rating-container">
                {renderStarRating(freelancer.Rating)}
                <span className="total-reviews">({freelancer.totalReviews || 0} reviews)</span>
              </div>
            )}
            
            <div className="profile-meta">
              {freelancer.location && (
                <div className="meta-item">
                  <FaMapMarkerAlt /> {freelancer.location}
                </div>
              )}
              
              <div className="meta-item">
                <FaCalendarAlt /> Member since {formatDate(freelancer.created_at || new Date())}
              </div>
              
              <div className="meta-item">
                <FaBriefcase /> {completedOrders.length} orders completed
              </div>
            </div>
            
            {!isOwnProfile && (
              <div className="profile-actions">
                <button className="contact-btn" onClick={handleContactFreelancer}>
                  Contact Me
                </button>
                <button className="view-gigs-btn" onClick={handleViewGigs}>
                  View My Gigs
                </button>
              </div>
            )}
            
            {isOwnProfile && (
              <div className="profile-actions">
                <button className="edit-profile-btn" onClick={() => navigate('/settings/profile')}>
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-bio">
          <h2>About Me</h2>
          <p>{freelancer.bio || 'This freelancer has not added a bio yet.'}</p>
        </div>
        
        {/* Work Experience Section */}
        <WorkExperience 
          freelancerId={freelancerId} 
          isEditable={isOwnProfile}
          limitToThree={true}
        />
        
        {/* Completed Orders Section */}
        {completedOrders.length > 0 && (
          <div className="completed-orders-section">
            <h2>Orders Completed on this Platform</h2>
            <div className="orders-list">
              {completedOrders.map(order => (
                <div key={order.Id} className="order-item">
                  <div className="order-image">
                    {order.gigImage ? (
                      <img 
                        src={getImageUrl(order.gigImage)} 
                        alt={order.gigTitle}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/300x200/e9e9e9/5d5d5d?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="no-image-placeholder">No Image</div>
                    )}
                  </div>
                  
                  <div className="order-content">
                    <h3>{order.gigTitle}</h3>
                    <div className="order-meta">
                      <span>Completed: {formatDate(order.Completed_At || order.Updated_At)}</span>
                      {order.review && (
                        <div className="order-rating">
                          {Array(5).fill(0).map((_, i) => (
                            <span key={i}>
                              {i < order.review.Rating ? (
                                <FaStar className="star filled" />
                              ) : (
                                <FaRegStar className="star empty" />
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {order.feedback && (
                      <p className="order-feedback">{order.feedback}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerProfile;
