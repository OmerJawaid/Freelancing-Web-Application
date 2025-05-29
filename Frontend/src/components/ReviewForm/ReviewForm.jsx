import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaSpinner, FaTimes } from 'react-icons/fa';
import './ReviewForm.css';

const ReviewForm = ({ orderId, onReviewSubmitted }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [canReview, setCanReview] = useState(false);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    // Check if the order can be reviewed
    const checkOrderForReview = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8081/reviews/check-order', {
          params: { Order_Id: orderId },
          withCredentials: true
        });
        
        setCanReview(response.data.canReview);
        if (response.data.canReview) {
          setOrderDetails(response.data.orderDetails);
        }
      } catch (err) {
        console.error('Error checking order for review:', err);
        setError('Unable to check if order can be reviewed');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      checkOrderForReview();
    }
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canReview || !orderId) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await axios.post('http://localhost:8081/reviews/create', {
        Order_Id: orderId,
        Rating: rating,
        Title: title,
        Description: description
      }, {
        withCredentials: true
      });
      
      if (response.status === 201) {
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data);
        }
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="review-form-loading">
        <FaSpinner className="spinner" /> Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-form-error">
        {error}
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="review-form-unavailable">
        This order cannot be reviewed at this time. The order may not be completed or has already been reviewed.
      </div>
    );
  }

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h2>Rate Your Experience</h2>
        <p className="review-form-subtitle">
          Share your experience with <strong>{orderDetails?.freelancer_Name}</strong> for gig <strong>{orderDetails?.gig_Title}</strong>
        </p>
        <button className="close-button" onClick={onReviewSubmitted}>
          <FaTimes />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-container">
          <label>Your Rating:</label>
          <div className="star-rating">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <FaStar
                  key={index}
                  className={`star-icon ${(hoverRating || rating) >= starValue ? 'filled' : 'empty'}`}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              );
            })}
          </div>
        </div>
        
        <div className="review-input-group">
          <label htmlFor="review-title">Review Title:</label>
          <input
            type="text"
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            required
          />
        </div>
        
        <div className="review-input-group">
          <label htmlFor="review-description">Review Details:</label>
          <textarea
            id="review-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell others about your experience with this freelancer..."
            rows={5}
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-review-button"
          disabled={submitting || !title}
        >
          {submitting ? (
            <>
              <FaSpinner className="spinner" /> Submitting...
            </>
          ) : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 