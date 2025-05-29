// Backend/router/dashboardRouter.js
import express from 'express';
import { calculateTotalEarnings, getFreelancerStats } from '../controller/DashboardStats.js';

const dashboardRouter = express.Router();

// Route to get total earnings for a freelancer
dashboardRouter.get('/earnings', calculateTotalEarnings);

// Route to get comprehensive dashboard stats for a freelancer
dashboardRouter.get('/freelancer-stats', getFreelancerStats);

export default dashboardRouter;
