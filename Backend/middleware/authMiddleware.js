// authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-jwt-tokens';

// Debug function to help identify token issues
const debugToken = (req) => {
  console.log('==== AUTH DEBUG INFO ====');
  console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  if (req.headers.authorization) {
    // Show the first few characters of the token for debugging
    const authParts = req.headers.authorization.split(' ');
    if (authParts.length > 1) {
      const token = authParts[1];
      console.log('Token prefix:', token.substring(0, 10) + '...');
    }
  }
  console.log('Cookies:', Object.keys(req.cookies || {}));
  console.log('Session user:', req.session && req.session.user ? 'Present' : 'Missing');
  if (req.session && req.session.user) {
    console.log('Session user type:', req.session.user.User_Type);
    console.log('Session user ID:', req.session.user.id);
  }
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  console.log('Content-Type:', req.headers['content-type'] || 'Not set');
  console.log('========================');
};

/**
 * Middleware to verify JWT token and set user information in request
 */
export const verifyToken = (req, res, next) => {
  // Debug request info
  debugToken(req);
  
  // First check if user is in session (most reliable source)
  if (req.session && req.session.user) {
    console.log('User found in session, using session authentication');
    req.user = req.session.user;
    return next();
  }
  
  // Extract token using various methods
  let token = null;
  
  // 1. Check Authorization header (most common for API requests)
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    // Handle both 'Bearer TOKEN' format and raw token
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
      console.log('Token extracted from Authorization Bearer header');
    } else if (parts.length === 1) {
      token = parts[0];
      console.log('Token extracted from Authorization header (no Bearer prefix)');
    }
  }
  
  // 2. Check cookies if no token in header
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Token extracted from cookies');
  }
  
  // 3. Check query parameters as last resort
  if (!token && req.query && req.query.token) {
    token = req.query.token;
    console.log('Token extracted from query parameters');
  }
  
  if (!token) {
    console.log('No token or session found in request');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully');
    
    // Handle different token payload formats
    if (decoded.user) {
      // Token format: { user: { id, User_Type, etc. } }
      req.user = decoded.user;
      console.log('User info extracted from token.user property');
    } else if (decoded.id) {
      // Token format: { id, User_Type, etc. }
      req.user = decoded;
      console.log('User info extracted directly from token');
    } else {
      // Unexpected token format
      console.error('Token has unexpected format:', Object.keys(decoded));
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    // Log the extracted user info for debugging
    console.log('User from token:', {
      id: req.user.id,
      userType: req.user.User_Type || req.user.user_type
    });
    
    // Store user in session for future requests
    if (req.session) {
      req.session.user = req.user;
      console.log('User stored in session for future requests');
    }
    
    // Continue to next middleware/controller
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ 
      message: 'Invalid or expired token', 
      details: error.message 
    });
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
