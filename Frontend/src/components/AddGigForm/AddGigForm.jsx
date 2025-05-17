import React, { useState } from 'react';
import axios from 'axios';
import './AddGigForm.css';

const AddGigForm = ({ userId, onGigAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image: null,
    imagePreview: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('freelancerId', userId);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post('http://localhost:8081/add-gig', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          title: '',
          description: '',
          price: '',
          category: '',
          image: null,
          imagePreview: null
        });
        
        // Refresh the gigs list
        if (onGigAdded) onGigAdded();
        
        // After 2 seconds, go back to the gigs list if onCancel is provided
        if (onCancel) {
          setTimeout(() => {
            onCancel();
          }, 2000);
        }
      } else {
        setError(response.data.message || 'Failed to add gig');
      }
    } catch (err) {
      console.error("Error adding gig:", err);
      setError(err.response?.data?.message || 'An error occurred while adding your gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-gig-form-container">
      <div className="section-header">
        <h2>Create a New Gig</h2>
      </div>
      
      {success && (
        <div className="success-message">
          Your gig has been successfully created!
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form className="add-gig-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Gig Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="I will do..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="web-development">Web Development</option>
            <option value="mobile-development">Mobile Development</option>
            <option value="design">Design</option>
            <option value="writing">Writing & Translation</option>
            <option value="marketing">Digital Marketing</option>
            <option value="video">Video & Animation</option>
            <option value="music">Music & Audio</option>
            <option value="programming">Programming & Tech</option>
            <option value="business">Business</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="100"
            min="5"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            placeholder="Describe your gig in detail..."
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="image">Gig Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            required
          />
          
          {formData.imagePreview && (
            <div className="image-preview">
              <img src={formData.imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-actions">
          {onCancel && (
            <button 
              type="button" 
              className="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Gig'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddGigForm; 