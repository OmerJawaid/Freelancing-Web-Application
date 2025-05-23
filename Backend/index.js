//index.js
import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import sessionMiddleware from './config/session.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Add this for password hashing
import configureSocket from './sockets/sockets.js';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { messageRouter } from './router/messageRouter.js';
import { conversationRouter } from './router/conversationRouter.js';
import authenticationRouter from './router/authenticationRoutes.js';
import { gigRouter } from './router/gigRouter.js';
import { packageRouter } from './router/packageRouter.js';
import { reviewRouter } from './router/reviewRouter.js';
import profileRouter from './router/profileRouter.js';

// Get current dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize Express application and HTTP server
 */
function initializeApp() {
  const app = express();
  const server = http.createServer(app);
  
  // Initialize Socket.IO
  configureSocket(server);
  
  return { app, server };
}

/**
 * Configure application middleware
 * @param {Object} app - Express application instance
 */
function configureMiddleware(app) {
  // Basic middleware
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  }));
  
  // Session handling
  app.use(sessionMiddleware);
  
  // Static file serving
  configureStaticFiles(app);
  
  // Request logging for static files
  app.use((req, res, next) => {
    if (req.path.includes('/public/') || req.path.includes('/profileImages/')) {
      console.log(`[Static File] ${req.method} ${req.path}`);
    }
    next();
  });
}

/**
 * Configure static file serving
 * @param {Object} app - Express application instance
 */
function configureStaticFiles(app) {
  const publicDir = path.join(__dirname, 'public');
  
  // Serve static files from the public directory
  app.use('/public', express.static(publicDir));
  
  // Also serve under root path for backward compatibility
  app.use('/', express.static(publicDir));
  
  console.log(`Static files configured from: ${publicDir}`);
}

/**
 * Configure API routes
 * @param {Object} app - Express application instance
 */
function configureRoutes(app) {
  // Health check endpoint
  app.get('/health-check', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend server is running' });
  });
  
  // API endpoints
  app.use('/messages', messageRouter);
  app.use('/conversations', conversationRouter);
  app.use('/authentication', authenticationRouter);
  app.use('/gigs', gigRouter);
  app.use('/packages', packageRouter);
  app.use('/reviews', reviewRouter);
  app.use('/profile', profileRouter);
  
  // Legacy endpoint for backward compatibility
  app.post('/create-conversation', (req, res) => {
    req.url = '/create';
    conversationRouter(req, res);
  });
}

/**
 * Start the server
 * @param {Object} server - HTTP server instance
 */
function startServer(server) {
  const PORT = process.env.PORT || 8081;
  
  server.on('error', (error) => {
    console.error(`
==================================
  Server failed to start
==================================`);
    if (error.syscall !== 'listen') {
      throw error;
    }
    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  server.listen(PORT, () => {
    console.log(`
==================================
  Server started successfully
==================================
  🚀 Port: ${PORT}
  🌐 Environment: ${process.env.NODE_ENV || 'development'}
  📁 Static files: ${path.join(__dirname, 'public')}
==================================
    `);
  });
}

// Initialize and start the application
const { app, server } = initializeApp();
configureMiddleware(app);
configureRoutes(app);
startServer(server);