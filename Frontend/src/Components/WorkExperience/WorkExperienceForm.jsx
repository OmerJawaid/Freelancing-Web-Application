import React, { useState, useEffect } from 'react';
import { FaTimes, FaImage, FaUpload, FaSave, FaTrash } from 'react-icons/fa';
import './WorkExperience.css';

const WorkExperienceForm = ({ freelancerId, experience, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    clientName: '',
    completionDate: '',
    skillsUsed: '',
  });
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (experience) {
      setFormData({
        projectTitle: experience.Project_Title || '',
        description: experience.Description || '',
        clientName: experience.Client_Name || '',
        completionDate: experience.Completion_Date 
          ? new Date(experience.Completion_Date).toISOString().split('T')[0] 
          : '',
        skillsUsed: experience.Skills_Used || '',
      });
    }
  }, [experience]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Limit to 5 images total
    if (selectedFiles.length + images.length > 5) {
      alert('You can upload a maximum of 5 images per work experience');
      return;
    }
    
    // Add to images array
    setImages(prev => [...prev, ...selectedFiles]);
    
    // Generate preview URLs
    const newPreviewImages = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      file
    }));
    
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
  };

  // Remove an image from the selection
  const handleRemoveImage = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewImages[index].url);
    
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Project title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create a FormData object for file uploads
      const data = new FormData();
      data.append('freelancerId', freelancerId);
      data.append('projectTitle', formData.projectTitle);
      data.append('description', formData.description);
      data.append('clientName', formData.clientName);
      data.append('completionDate', formData.completionDate);
      data.append('skillsUsed', formData.skillsUsed);
      
      // Add all selected images
      images.forEach(image => {
        data.append('images', image);
      });
      
      // Call the onSubmit callback with the form data
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to save work experience. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="work-experience-form">
      <div className="form-header">
        <h3>{experience ? 'Edit Project' : 'Add New Project'}</h3>
        <button className="close-btn" onClick={onCancel} title="Close">
          <FaTimes />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectTitle">Project Title*</label>
          <input
            type="text"
            id="projectTitle"
            name="projectTitle"
            value={formData.projectTitle}
            onChange={handleChange}
            className={errors.projectTitle ? 'error' : ''}
            placeholder="E.g., Website Redesign, Mobile App Development"
            required
          />
          {errors.projectTitle && <div className="error-message">{errors.projectTitle}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="clientName">Client Name</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="E.g., ABC Company, John Smith"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="completionDate">Completion Date</label>
          <input
            type="date"
            id="completionDate"
            name="completionDate"
            value={formData.completionDate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Project Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the project, your role, and the results achieved"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="skillsUsed">Skills Used</label>
          <input
            type="text"
            id="skillsUsed"
            name="skillsUsed"
            value={formData.skillsUsed}
            onChange={handleChange}
            placeholder="E.g., React, Node.js, UI/UX Design"
          />
          <small>Separate skills with commas</small>
        </div>
        
        <div className="form-group">
          <label>Project Images (Max 5)</label>
          <div className="image-upload-container">
            <label htmlFor="images" className="image-upload-label">
              <FaImage /> <span>Select Images</span>
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <small>Upload screenshots or images related to your project</small>
          </div>
          
          {previewImages.length > 0 && (
            <div className="image-previews">
              {previewImages.map((image, index) => (
                <div className="image-preview-item" key={`preview-${index}`}>
                  <img src={image.url} alt={`Preview ${index}`} />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => handleRemoveImage(index)}
                    title="Remove image"
                  >
                    <FaTrash />
                  </button>
                  <span className="image-name">{image.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {errors.submit && <div className="error-message form-error">{errors.submit}</div>}
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Project'} {!loading && <FaSave />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkExperienceForm;
