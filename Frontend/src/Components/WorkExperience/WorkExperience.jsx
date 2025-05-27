import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaStar } from 'react-icons/fa';
import axios from 'axios';
import './WorkExperience.css';
import WorkExperienceForm from './WorkExperienceForm';

const WorkExperience = ({ freelancerId, isEditable = false, limitToThree = true }) => {
  const [workExperiences, setWorkExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch work experiences for the freelancer
  useEffect(() => {
    const fetchWorkExperiences = async () => {
      if (!freelancerId) return;
      
      setLoading(true);
      try {
        const response = await axios.get(
          `/work-experience/retrieve`,
          {
            params: { freelancerId },
            withCredentials: true
          }
        );
        
        setWorkExperiences(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching work experiences:', error);
        setError('Failed to load work experience data');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkExperiences();
  }, [freelancerId]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  // Handle adding new work experience
  const handleAddNew = () => {
    setEditingExperience(null);
    setShowForm(true);
  };

  // Handle editing existing work experience
  const handleEdit = (experience) => {
    setEditingExperience(experience);
    setShowForm(true);
  };

  // Handle deleting work experience
  const handleDelete = async (id) => {
    if (confirmDelete === id) {
      try {
        await axios.delete(
          `/work-experience/delete/${id}`,
          { withCredentials: true }
        );
        
        setWorkExperiences(prev => prev.filter(exp => exp.Id !== id));
        setConfirmDelete(null);
      } catch (error) {
        console.error('Error deleting work experience:', error);
        alert('Failed to delete work experience. Please try again.');
      }
    } else {
      setConfirmDelete(id);
      // Reset confirm state after 3 seconds
      setTimeout(() => {
        setConfirmDelete(null);
      }, 3000);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      if (editingExperience) {
        // Update existing work experience
        await axios.put(
          `/work-experience/update/${editingExperience.Id}`,
          formData,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Refresh the list after update
        const response = await axios.get(
          `/work-experience/retrieve`,
          {
            params: { freelancerId },
            withCredentials: true
          }
        );
        
        setWorkExperiences(response.data);
      } else {
        // Create new work experience
        const response = await axios.post(
          `/work-experience/create`,
          formData,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Refresh the list after creation
        const updatedResponse = await axios.get(
          `/work-experience/retrieve`,
          {
            params: { freelancerId },
            withCredentials: true
          }
        );
        
        setWorkExperiences(updatedResponse.data);
      }
      
      setShowForm(false);
      setEditingExperience(null);
    } catch (error) {
      console.error('Error saving work experience:', error);
      alert('Failed to save work experience. Please try again.');
    }
  };

  // Cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExperience(null);
  };

  // Filter to show only 3 experiences if limitToThree is true
  const displayedExperiences = limitToThree 
    ? workExperiences.slice(0, 3) 
    : workExperiences;

  if (loading) {
    return <div className="work-experience-loading">Loading work experience...</div>;
  }

  if (error) {
    return <div className="work-experience-error">{error}</div>;
  }

  return (
    <div className="work-experience-container">
      <div className="work-experience-header">
        <h2>Work Experience</h2>
        {isEditable && workExperiences.length < 3 && (
          <button 
            className="add-work-experience-btn" 
            onClick={handleAddNew}
            title="Add work experience"
          >
            <FaPlus /> Add Project
          </button>
        )}
      </div>
      
      {displayedExperiences.length === 0 ? (
        <div className="no-work-experience">
          {isEditable ? (
            <p>You haven't added any work experience yet. Add your past projects to showcase your skills.</p>
          ) : (
            <p>This freelancer hasn't added any work experience yet.</p>
          )}
        </div>
      ) : (
        <div className="work-experience-list">
          {displayedExperiences.map((experience) => (
            <div key={experience.Id} className="work-experience-item">
              <div className="work-experience-image">
                {experience.primaryImage ? (
                  <img 
                    src={`${experience.primaryImage}`} 
                    alt={experience.Project_Title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/300x200/e9e9e9/5d5d5d?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              
              <div className="work-experience-content">
                <div className="work-experience-header">
                  <h3>{experience.Project_Title}</h3>
                  
                  {isEditable && (
                    <div className="work-experience-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(experience)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className={`delete-btn ${confirmDelete === experience.Id ? 'confirm' : ''}`}
                        onClick={() => handleDelete(experience.Id)}
                        title={confirmDelete === experience.Id ? "Click again to confirm" : "Delete"}
                      >
                        {confirmDelete === experience.Id ? <FaCheck /> : <FaTrash />}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="work-experience-meta">
                  {experience.Client_Name && (
                    <span className="client-name">
                      <strong>Client:</strong> {experience.Client_Name}
                    </span>
                  )}
                  {experience.Completion_Date && (
                    <span className="completion-date">
                      <strong>Completed:</strong> {formatDate(experience.Completion_Date)}
                    </span>
                  )}
                </div>
                
                {experience.Description && (
                  <p className="work-experience-description">{experience.Description}</p>
                )}
                
                {experience.Skills_Used && (
                  <div className="work-experience-skills">
                    <strong>Skills:</strong> {experience.Skills_Used}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showForm && (
        <div className="work-experience-form-overlay">
          <div className="work-experience-form-container">
            <WorkExperienceForm 
              freelancerId={freelancerId}
              experience={editingExperience}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkExperience;
