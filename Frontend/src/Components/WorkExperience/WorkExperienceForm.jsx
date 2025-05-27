import React, { useState, useRef } from 'react';
import { FaCalendarAlt, FaUser, FaTools, FaTimes, FaImage, FaUpload } from 'react-icons/fa';
import './WorkExperience.css';

const WorkExperienceForm = ({ freelancerId, experience = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    freelancerId: freelancerId,
    projectTitle: experience ? experience.Project_Title : '',
    description: experience ? experience.Description || '' : '',
    clientName: experience ? experience.Client_Name || '' : '',
    completionDate: experience && experience.Completion_Date ? 
      new Date(experience.Completion_Date).toISOString().split('T')[0] : '',
    skillsUsed: experience ? experience.Skills_Used || '' : ''
  });
  
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        setErrors(prev => ({
          ...prev,
          images: 'Only JPEG, PNG, and WebP images are allowed'
        }));
      }
      
      if (!isValidSize) {
        setErrors(prev => ({
          ...prev,
          images: 'Images must be less than 5MB'
        }));
      }
      
      return isValidType && isValidSize;
    });
    
    if (validFiles.length === 0) return;
    
    // Check if adding these files would exceed the limit of 5 images
    if (validFiles.length + images.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed'
      }));
      return;
    }
    
    setImages(prev => [...prev, ...validFiles]);
    
    // Generate previews
    const newPreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    
    setImagePreview(prev => [...prev, ...newPreviews]);
    
    // Clear the file input
    e.target.value = null;
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreview[index].url);
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Project title is required';
    }
    
    if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prepare data for API
    const apiData = {
      freelancerId: formData.freelancerId,
      projectTitle: formData.projectTitle,
      description: formData.description,
      clientName: formData.clientName,
      completionDate: formData.completionDate || null,
      skillsUsed: formData.skillsUsed
    };
    
    onSubmit(apiData, images);
  };

  return (
    <div className="work-experience-form-container">
      <h3>{experience ? 'Edit Work Experience' : 'Add New Work Experience'}</h3>
      
      <form onSubmit={handleSubmit} className="work-experience-form">
        <div className="form-group">
          <label htmlFor="projectTitle">Project Title *</label>
          <input
            type="text"
            id="projectTitle"
            name="projectTitle"
            value={formData.projectTitle}
            onChange={handleChange}
            placeholder="Enter project title"
            className={errors.projectTitle ? 'error' : ''}
          />
          {errors.projectTitle && <div className="error-message">{errors.projectTitle}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="clientName">Client Name</label>
          <div className="input-with-icon">
            <FaUser className="input-icon" />
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="Enter client name"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="completionDate">Completion Date</label>
          <div className="input-with-icon">
            <FaCalendarAlt className="input-icon" />
            <input
              type="date"
              id="completionDate"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="skillsUsed">Skills Used</label>
          <div className="input-with-icon">
            <FaTools className="input-icon" />
            <input
              type="text"
              id="skillsUsed"
              name="skillsUsed"
              value={formData.skillsUsed}
              onChange={handleChange}
              placeholder="e.g., JavaScript, React, Node.js"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Project Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your project and your role in it"
            rows={4}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <div className="error-message">{errors.description}</div>}
          <div className="char-count">
            {formData.description.length}/1000 characters
          </div>
        </div>
        
        <div className="form-group">
          <label>Project Images (Max 5)</label>
          <div className="image-upload-container">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/jpg,image/webp"
              multiple
              style={{ display: 'none' }}
            />
            
            <button 
              type="button" 
              className="upload-btn"
              onClick={triggerFileInput}
              disabled={images.length >= 5}
            >
              <FaUpload /> Upload Images
            </button>
            
            <div className="upload-info">
              {images.length}/5 images • Max 5MB each • JPEG, PNG, WebP
            </div>
            
            {errors.images && <div className="error-message">{errors.images}</div>}
          </div>
          
          {imagePreview.length > 0 && (
            <div className="image-preview-container">
              {imagePreview.map((preview, index) => (
                <div key={index} className="image-preview">
                  <img src={preview.url} alt={`Preview ${index}`} />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {experience && experience.images && experience.images.length > 0 && (
            <div className="existing-images">
              <div className="existing-images-label">Current Images:</div>
              <div className="image-preview-container">
                {experience.images.map((img) => (
                  <div key={img.id} className={`image-preview ${img.isPrimary ? 'primary' : ''}`}>
                    <img 
                      src={`https://freelancing-web-application-production.up.railway.app${img.imageUrl}`} 
                      alt="Existing project image" 
                    />
                    {img.isPrimary && <div className="primary-badge">Primary</div>}
                  </div>
                ))}
              </div>
              <div className="image-note">
                * To manage existing images (delete or set as primary), please save this form first, then use the edit options.
              </div>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {experience ? 'Update Experience' : 'Add Experience'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkExperienceForm;
