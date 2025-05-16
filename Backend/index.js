//index.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import sessionMiddleware from './config/session.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Add this for password hashing
import configureSocket from './sockets/sockets.js';
import http from 'http';

import { messageRouter } from './router/messageRouter.js';
import { conversationRouter } from './router/conversationRouter.js';
import { authenticationRouter } from './router/authenticationRoutes.js';
import { gigRouter } from './router/gigRouter.js';
import { packageRouter } from './router/packageRouter.js';
import { reviewRouter } from './router/reviewRouter.js';

const app = express();
const server = http.createServer(app);
const io = configureSocket(server);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Single CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(sessionMiddleware);

// Health check endpoint
app.get('/health-check', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

//Messages
app.use('/messages', messageRouter);
//Conversations
app.use('/conversations',conversationRouter);
// Direct conversation creation endpoint for backward compatibility
app.post('/create-conversation', (req, res) => {
  // Forward to the proper endpoint
  req.url = '/create';
  conversationRouter(req, res);
});
//Authentication
app.use('/authentication',authenticationRouter);
//Gig
app.use('/gigs',gigRouter);
//Packages
app.use('/packages',packageRouter);
//Reviews
app.use('/reviews',reviewRouter);

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});