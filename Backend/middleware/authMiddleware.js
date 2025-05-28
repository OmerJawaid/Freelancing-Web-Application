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
  console.log('Cookies:', Object.keys(req.cookies || {}));
  console.log('Session user:', req.session && req.session.user ? 'Present' : 'Missing');
  if (req.session && req.session.user) {
    console.log('Session user type:', req.session.user.User_Type);
    console.log('Session user ID:', req.session.user.id);
  }
  console.log('========================');
};

/**
 * Middleware to verify JWT token and set user information in request
 */
export const verifyToken = (req, res, next) => {
  // Debug request info
  debugToken(req);
  
  // First check if user is in session
  if (req.session && req.session.user) {
    console.log('User found in session, using session authentication');
    req.user = req.session.user;
    return next();
  }
  
  // Look for token in cookies, headers, or query parameters
  const token = 
    req.cookies.token || 
    (req.headers.authorization && req.headers.authorization.split(' ')[1]) ||
    req.query.token;
  
  if (!token) {
    console.log('No token or session found in request');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded ? 'yes' : 'no');
    
    // Set user information in request object
    // The token contains user info in the 'user' property based on how it's generated in Authentication.js
    if (decoded.user) {
      req.user = decoded.user;
    } else {
      req.user = decoded;
    }
    
    // Store user in session for future requests
    if (req.session) {
      req.session.user = req.user;
    }
    
    console.log('User authenticated via token:', req.user.id);
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
