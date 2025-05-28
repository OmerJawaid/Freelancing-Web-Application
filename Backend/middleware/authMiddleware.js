// authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-jwt-tokens';

/**
 * Middleware to verify JWT token and set user information in request
 */
export const verifyToken = (req, res, next) => {
  // Look for token in cookies, headers, or query parameters
  const token = 
    req.cookies.token || 
    (req.headers.authorization && req.headers.authorization.split(' ')[1]) ||
    req.query.token;
  
  // Log debugging information
  console.log('Auth headers:', req.headers.authorization);
  console.log('Cookies:', req.cookies);
  
  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ message: 'No authentication token provided' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Set user information in request object
    req.user = decoded;
    console.log('Token verified, user:', decoded);
    
    // Continue to the next middleware/controller
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user is a freelancer
 * Must be used after verifyToken middleware
 */
export const isFreelancer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.User_Type !== 'freelancer') {
    return res.status(403).json({ message: 'Only freelancers can access this resource' });
  }
  
  next();
};

/**
 * Middleware to check if user is a client
 * Must be used after verifyToken middleware
 */
export const isClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.User_Type !== 'client') {
    return res.status(403).json({ message: 'Only clients can access this resource' });
  }
  
  next();
};
