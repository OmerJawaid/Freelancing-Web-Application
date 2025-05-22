import express from 'express';
import { createOrder, getClientOrders, getFreelancerOrders, updateOrderStatus } from "../controller/Order.js";

const orderRouter = express.Router();

// Create a new order
orderRouter.post('/create', createOrder);

// Get orders for a client
orderRouter.get('/client', getClientOrders);

// Get orders for a freelancer
orderRouter.get('/freelancer', getFreelancerOrders);

// Update order status
orderRouter.put('/status/:Id', updateOrderStatus);

export { orderRouter }; 