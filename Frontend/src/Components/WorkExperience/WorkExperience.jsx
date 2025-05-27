import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaTools, FaTrash, FaPencilAlt, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import './WorkExperience.css';
import { toast } from 'react-toastify';
import WorkExperienceForm from './WorkExperienceForm';

const WorkExperience = ({ freelancerId, isOwner = false, maxDisplay = 3 }) => {
  const [workExperiences, setWorkExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const apiUrl = 'https://freelancing-web-application-production.up.railway.app';

  useEffect(() => {
    fetchWorkExperiences();
  }, [freelancerId]);

  const fetchWorkExperiences = async () => {
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

  const handleDelete = async (id) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    try {
      const response = await axios.delete(
        `${apiUrl}/work-experience/delete/${id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setWorkExperiences(prevExperiences => 
          prevExperiences.filter(exp => exp.Id !== id)
        );
        toast.success('Work experience deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete work experience');
      }
    } catch (err) {
      console.error('Error deleting work experience:', err);
      toast.error('An error occurred while deleting the work experience');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleEdit = (experience) => {
    setEditingExperience(experience);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingExperience(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData, images) => {
    try {
      let response;
      
      // Create or update the work experience
      if (editingExperience) {
        response = await axios.put(
          `${apiUrl}/work-experience/update/${editingExperience.Id}`,
          formData,
          { withCredentials: true }
        );
      } else {
        response = await axios.post(
          `${apiUrl}/work-experience/add`,
          formData,
          { withCredentials: true }
        );
      }
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save work experience');
      }
      
      // If we have images to upload and the operation was successful
      if (images && images.length > 0) {
        const workExperienceId = editingExperience ? 
          editingExperience.Id : response.data.workExperienceId;
        
        const formDataImages = new FormData();
        images.forEach(image => {
          formDataImages.append('images', image);
        });
        
        const imageResponse = await axios.post(
          `${apiUrl}/work-experience/upload-images/${workExperienceId}`,
          formDataImages,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (!imageResponse.data.success) {
          toast.warning('Work experience saved but some images failed to upload');
        }
      }
      
      // Refresh the list
      fetchWorkExperiences();
      setShowForm(false);
      setEditingExperience(null);
      
      toast.success(editingExperience ? 
        'Work experience updated successfully' : 
        'Work experience added successfully'
      );
    } catch (err) {
      console.error('Error saving work experience:', err);
      toast.error(err.message || 'An error occurred while saving the work experience');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingExperience(null);
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

  if (loading) {
    return <div className="work-experience-loading">Loading work experiences...</div>;
  }

  if (error) {
    return <div className="work-experience-error">{error}</div>;
  }

  return (
    <div className="work-experience-container">
      <div className="work-experience-header">
        <h2>Work Experience</h2>
        {isOwner && workExperiences.length < 3 && (
          <button 
            className="add-experience-btn"
            onClick={handleAddNew}
          >
            <FaPlus /> Add Experience
          </button>
        )}
      </div>

      {showForm && (
        <WorkExperienceForm 
          freelancerId={freelancerId}
          experience={editingExperience}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {workExperiences.length === 0 ? (
        <div className="no-experience">
          {isOwner ? 
            "You haven't added any work experience yet. Add your past projects to showcase your skills!" :
            "This freelancer hasn't added any work experience yet."}
        </div>
      ) : (
        <div className="work-experience-list">
          {workExperiences.slice(0, maxDisplay).map(experience => (
            <div key={experience.Id} className="work-experience-card">
              <div className="work-experience-image">
                {getPrimaryImage(experience) ? (
                  <img 
                    src={getPrimaryImage(experience)} 
                    alt={experience.Project_Title} 
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              
              <div className="work-experience-content">
                <h3>{experience.Project_Title}</h3>
                
                <div className="work-experience-details">
                  {experience.Client_Name && (
                    <div className="detail-item">
                      <FaUser className="icon" />
                      <span>Client: {experience.Client_Name}</span>
                    </div>
                  )}
                  
                  {experience.Completion_Date && (
                    <div className="detail-item">
                      <FaCalendarAlt className="icon" />
                      <span>Completed: {formatDate(experience.Completion_Date)}</span>
                    </div>
                  )}
                  
                  {experience.Skills_Used && (
                    <div className="detail-item">
                      <FaTools className="icon" />
                      <span>Skills: {experience.Skills_Used}</span>
                    </div>
                  )}
                </div>
                
                <p className="description">{experience.Description}</p>
                
                {experience.images && experience.images.length > 1 && (
                  <div className="image-thumbnails">
                    {experience.images.slice(0, 4).map(img => (
                      <img 
                        key={img.id}
                        src={`${apiUrl}${img.imageUrl}`}
                        alt="Project thumbnail"
                        className={img.isPrimary ? 'primary' : ''}
                      />
                    ))}
                    {experience.images.length > 4 && (
                      <div className="more-images">+{experience.images.length - 4}</div>
                    )}
                  </div>
                )}
              </div>
              
              {isOwner && (
                <div className="work-experience-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(experience)}
                  >
                    <FaPencilAlt />
                  </button>
                  
                  <button 
                    className={`delete-btn ${confirmDelete === experience.Id ? 'confirm' : ''}`}
                    onClick={() => handleDelete(experience.Id)}
                  >
                    <FaTrash />
                    {confirmDelete === experience.Id && <span>Confirm</span>}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkExperience;
