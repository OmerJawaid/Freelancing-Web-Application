import express from 'express';
import { createOrder, getClientOrders, getFreelancerOrders, updateOrderStatus, uploadCompletedWork, downloadCompletedWork, approveCompletedWork, disapproveCompletedWork, upload } from "../controller/Order.js";

const orderRouter = express.Router();

// Create a new order
orderRouter.post('/create', createOrder);

// Get orders for a client
orderRouter.get('/client', getClientOrders);

// Get orders for a freelancer
orderRouter.get('/freelancer', getFreelancerOrders);

// Update order status
orderRouter.put('/status/:Id', updateOrderStatus);

// Upload completed work file
orderRouter.post('/upload/:Id', upload.single('completedWork'), uploadCompletedWork);

// Download completed work file
orderRouter.get('/download/:Id', downloadCompletedWork);

// Approve completed work
orderRouter.put('/approve/:Id', approveCompletedWork);

// Disapprove completed work
orderRouter.put('/disapprove/:Id', disapproveCompletedWork);

export { orderRouter }; 