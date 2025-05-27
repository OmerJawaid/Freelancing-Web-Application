import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaMapMarkerAlt, FaUser, FaCalendarAlt, FaBriefcase, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../../Components/Navbar Client/Navbar';
import WorkExperience from '../../Components/WorkExperience/WorkExperience';
import { getImageUrl, DEFAULT_USER_IMAGE } from '../../utils/imageUtils';
import './FreelancerProfile.css';

const FreelancerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  
  const apiUrl = 'https://freelancing-web-application-production.up.railway.app';

  useEffect(() => {
    const fetchFreelancerData = async () => {
      setLoading(true);
      try {
        // Get the current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Fetch freelancer data
        const response = await axios.get(
          `${apiUrl}/profile/freelancer/${id}`,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setFreelancer(response.data.freelancer);
          
          // Check if the current user is the owner of this profile
          setIsOwner(currentUser && currentUser.id === parseInt(id));
        } else {
          setError('Failed to load freelancer profile');
        }
        
        // Fetch completed orders for this freelancer
        try {
          const ordersResponse = await axios.get(
            `${apiUrl}/orders/completed-by-freelancer/${id}`,
            { withCredentials: true }
          );
          
          if (ordersResponse.data.success) {
            setCompletedOrders(ordersResponse.data.orders || []);
          }
        } catch (orderErr) {
          console.error('Error fetching orders:', orderErr);
          // Don't fail the whole profile if orders can't be fetched
          setCompletedOrders([]);
        }
      } catch (err) {
        console.error('Error fetching freelancer data:', err);
        
        // Try to fetch user data as a fallback
        try {
          // Attempt to get basic user data if profile endpoint fails
          const userResponse = await axios.get(
            `${apiUrl}/user/${id}`,
            { withCredentials: true }
          );
          
          if (userResponse.data && userResponse.data.User_Type === 'freelancer') {
            setFreelancer({
              id: userResponse.data.id,
              Email: userResponse.data.Email,
              Image: userResponse.data.Image,
              Name: userResponse.data.Name || 'Freelancer',
              bio: 'No bio available',
              Rating: 0,
              completedOrdersCount: 0
            });
            
            // Check if the current user is the owner of this profile
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            setIsOwner(currentUser && currentUser.id === parseInt(id));
          } else {
            setError('Freelancer profile not found');
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch failed:', fallbackErr);
          setError('Freelancer profile not found');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFreelancerData();
  }, [id, navigate, apiUrl]);
  
  if (loading) {
    return (
      <div className="freelancer-profile-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading freelancer profile...</p>
        </div>
      </div>
    );
  }
  
  if (error || !freelancer) {
    return (
      <div className="freelancer-profile-container">
        <Navbar />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Failed to load freelancer profile'}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="freelancer-profile-container">
      <Navbar />
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-image">
            <img 
              src={getImageUrl(freelancer.Image, DEFAULT_USER_IMAGE)} 
              alt={freelancer.Name} 
            />
          </div>
          
          <div className="profile-info">
            <h1>{freelancer.Name}</h1>
            
            <div className="profile-meta">
              {freelancer.location && (
                <div className="meta-item">
                  <FaMapMarkerAlt />
                  <span>{freelancer.location}</span>
                </div>
              )}
              
              <div className="meta-item">
                <FaStar />
                <span>{freelancer.Rating ? freelancer.Rating.toFixed(1) : 'No ratings'}</span>
              </div>
              
              <div className="meta-item">
                <FaBriefcase />
                <span>{completedOrders.length} orders completed</span>
              </div>
              
              <div className="meta-item">
                <FaCalendarAlt />
                <span>Member since {new Date(freelancer.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {isOwner && (
              <div className="profile-actions">
                <button 
                  className="edit-profile-btn"
                  onClick={() => navigate('/edit-profile')}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-body">
          <div className="profile-main">
            <div className="profile-section">
              <h2>About Me</h2>
              <p className="bio">{freelancer.bio || 'No bio provided'}</p>
            </div>
            
            {/* Work Experience Section */}
            <WorkExperience 
              freelancerId={id} 
              isOwner={isOwner}
            />
            
            {completedOrders.length > 0 && (
              <div className="profile-section">
                <h2>Completed Orders</h2>
                <div className="completed-orders">
                  {completedOrders.map(order => (
                    <div key={order.Id} className="order-card">
                      <div className="order-image">
                        <img 
                          src={getImageUrl(order.gig_image, 'https://placehold.co/100/e9ecef/495057?text=Gig')} 
                          alt={order.gig_title} 
                        />
                      </div>
                      
                      <div className="order-content">
                        <h3>{order.gig_title}</h3>
                        <div className="order-meta">
                          <div className="meta-item">
                            <FaUser />
                            <span>Client: {order.client_name}</span>
                          </div>
                          
                          <div className="meta-item">
                            <FaCalendarAlt />
                            <span>Completed: {new Date(order.Completed_At).toLocaleDateString()}</span>
                          </div>
                          
                          {order.Rating && (
                            <div className="meta-item">
                              <FaStar />
                              <span>Rating: {order.Rating}</span>
                            </div>
                          )}
                        </div>
                        
                        {order.feedback && (
                          <div className="order-feedback">
                            <p>"{order.feedback}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="profile-sidebar">
            <div className="sidebar-section">
              <h3>Skills</h3>
              {freelancer.skills ? (
                <div className="skills-list">
                  {freelancer.skills.split(',').map((skill, index) => (
                    <span key={index} className="skill-tag">{skill.trim()}</span>
                  ))}
                </div>
              ) : (
                <p className="no-data">No skills listed</p>
              )}
            </div>
            
            <div className="sidebar-section">
              <h3>Languages</h3>
              {freelancer.languages ? (
                <div className="languages-list">
                  {freelancer.languages.split(',').map((language, index) => (
                    <div key={index} className="language-item">
                      <FaCheckCircle />
                      <span>{language.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No languages listed</p>
              )}
            </div>
            
            <div className="sidebar-section">
              <h3>Education</h3>
              {freelancer.education ? (
                <div className="education-list">
                  {freelancer.education.split(',').map((edu, index) => (
                    <div key={index} className="education-item">
                      <p>{edu.trim()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No education listed</p>
              )}
            </div>
            
            <div className="contact-section">
              <button 
                className="contact-btn"
                onClick={() => navigate(`/messages?user=${id}`)}
              >
                Contact Freelancer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
