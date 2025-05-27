import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaTools, FaImage, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import './WorkExperienceSelector.css';

/**
 * Component to display a carousel of work experiences for a freelancer
 * Used on gig pages to showcase the freelancer's past work
 */
const WorkExperienceSelector = ({ freelancerId, maxDisplay = 3 }) => {
  const [workExperiences, setWorkExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const apiUrl = 'https://freelancing-web-application-production.up.railway.app';

  useEffect(() => {
    fetchWorkExperiences();
  }, [freelancerId]);

  const fetchWorkExperiences = async () => {
    if (!freelancerId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/work-experience/freelancer/${freelancerId}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setWorkExperiences(response.data.workExperiences || []);
      } else {
        setError('Failed to load work experiences');
      }
    } catch (err) {
      console.error('Error fetching work experiences:', err);
      setError('An error occurred while loading work experiences');
    } finally {
      setLoading(false);
    }
  };

  // Get the primary image URL for a work experience
  const getPrimaryImage = (experience) => {
    if (!experience.images || experience.images.length === 0) {
      return null;
    }
    
    const primaryImage = experience.images.find(img => img.isPrimary);
    return primaryImage ? 
      `${apiUrl}${primaryImage.imageUrl}` : 
      `${apiUrl}${experience.images[0].imageUrl}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => 
      prev === 0 ? workExperiences.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex(prev => 
      prev === workExperiences.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return <div className="work-experience-selector-loading">Loading past work...</div>;
  }

  if (error) {
    return null; // Don't show errors on gig page, just hide the component
  }

  if (workExperiences.length === 0) {
    return null; // Don't show empty state on gig page, just hide the component
  }

  return (
    <div className="work-experience-selector">
      <h3 className="selector-title">Past Work</h3>
      
      <div className="experience-carousel">
        {workExperiences.length > 1 && (
          <button 
            className="carousel-nav prev"
            onClick={handlePrevious}
            aria-label="Previous work experience"
          >
            <FaChevronLeft />
          </button>
        )}
        
        <div className="experience-slide">
          {workExperiences[currentIndex] && (
            <div className="experience-card">
              <div className="experience-image">
                {getPrimaryImage(workExperiences[currentIndex]) ? (
                  <img 
                    src={getPrimaryImage(workExperiences[currentIndex])} 
                    alt={workExperiences[currentIndex].Project_Title} 
                  />
                ) : (
                  <div className="no-image">
                    <FaImage />
                    <span>No Image</span>
                  </div>
                )}
              </div>
              
              <div className="experience-content">
                <h4>{workExperiences[currentIndex].Project_Title}</h4>
                
                <div className="experience-details">
                  {workExperiences[currentIndex].Client_Name && (
                    <div className="detail-item">
                      <FaUser className="icon" />
                      <span>{workExperiences[currentIndex].Client_Name}</span>
                    </div>
                  )}
                  
                  {workExperiences[currentIndex].Completion_Date && (
                    <div className="detail-item">
                      <FaCalendarAlt className="icon" />
                      <span>{formatDate(workExperiences[currentIndex].Completion_Date)}</span>
                    </div>
                  )}
                  
                  {workExperiences[currentIndex].Skills_Used && (
                    <div className="detail-item">
                      <FaTools className="icon" />
                      <span>{workExperiences[currentIndex].Skills_Used}</span>
                    </div>
                  )}
                </div>
                
                <p className="experience-description">
                  {workExperiences[currentIndex].Description}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {workExperiences.length > 1 && (
          <button 
            className="carousel-nav next"
            onClick={handleNext}
            aria-label="Next work experience"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
      
      {workExperiences.length > 1 && (
        <div className="carousel-indicators">
          {workExperiences.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to work experience ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkExperienceSelector;
