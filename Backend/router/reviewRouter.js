import express from 'express';
import { 
    fetchReviewsByGigId, 
    fetchReviewsByFreelancerId, 
    checkOrderForReview, 
    createReview, 
    getClientReviews, 
    getFreelancerReviewStats,
    checkReviewsTable
} from '../controller/Reviews.js';

const reviewRouter = express.Router();

// Get reviews for a specific gig
reviewRouter.get('/retrieve', fetchReviewsByGigId);

// Get reviews for a specific freelancer
reviewRouter.get('/freelancer', fetchReviewsByFreelancerId);

// Check if an order can be reviewed
reviewRouter.get('/check-order', checkOrderForReview);

// Create a new review
reviewRouter.post('/create', createReview);

// Get reviews submitted by a client
reviewRouter.get('/client', getClientReviews);

// Get review statistics for a freelancer
reviewRouter.get('/stats', getFreelancerReviewStats);

// Debug endpoint to check reviews table
reviewRouter.get('/debug', checkReviewsTable);

export { reviewRouter };