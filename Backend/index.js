// Backend/server.js or index.js
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Add this for password hashing

const app = express();
const PORT = 8081;

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ahmad123',
  database: 'skillify'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Your React Vite app URL
  credentials: true
}));

// Session configuration
app.use(session({
  secret: 'your_secret_key', // Change this to a secure random string
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Set to true in production (HTTPS)
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.session.token;
  
  if (!token) {
    return res.status(401).json({ authenticated: false, message: 'No session found' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    req.session.destroy();
    return res.status(401).json({ authenticated: false, message: 'Session expired' });
  }
};

// Routes
app.post('/login', async (req, res) => {
  const { Email, Password } = req.body; // Match the frontend field names

  if (!Email || !Password) {
    return res.status(400).json({ 
      Authenticate: false, 
      message: 'Email and password are required' 
    });
  }
  
  try {
    // Query to check user credentials
    const query = 'SELECT * FROM users WHERE Email = ?';
    
    db.query(query, [Email], async (err, results) => {
      if (err) {
        console.error('Login query error:', err);
        return res.status(500).json({ 
          Authenticate: false, 
          message: 'Server error' 
        });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ 
          Authenticate: false, 
          message: 'Invalid email or password' 
        });
      }
      
      const user = results[0];
      
      // Compare passwords
      const passwordMatch = await bcrypt.compare(Password, user.Password);
      
      if (!passwordMatch) {
        return res.status(401).json({ 
          Authenticate: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Create JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.Email,
          userType: user.User_Type
        },
        'your_jwt_secret_key',
        { expiresIn: '24h' }
      );
      
      // Store token in session
      req.session.token = token;
      req.session.user = {
        id: user.id,
        email: user.Email,
        User_Type: user.User_Type
      };
      
      res.json({ 
        Authenticate: true,
        user: {
          id: user.id,
          email: user.Email,
          User_Type: user.User_Type
        },
        message: 'Login successful'
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      Authenticate: false, 
      message: 'An error occurred during login' 
    });
  }
});

// Check authentication status
app.get('/check-auth', (req, res) => {
  if (req.session.user && req.session.token) {
    try {
      jwt.verify(req.session.token, 'your_jwt_secret_key');
      res.json({ 
        authenticated: true, 
        user: req.session.user 
      });
    } catch (error) {
      req.session.destroy();
      res.json({ 
        authenticated: false, 
        message: 'Session expired' 
      });
    }
  } else {
    res.json({ authenticated: false });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to logout' 
      });
    }
    res.clearCookie('connect.sid');
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

// Protected routes example
app.get('/client-data', authenticateUser, (req, res) => {
  if (req.user.userType !== 'client') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  
  // Fetch client-specific data here
  res.json({ success: true, data: 'Client data here' });
});

app.get('/freelancer-data', authenticateUser, (req, res) => {
  if (req.user.userType !== 'freelancer') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  
  // Fetch freelancer-specific data here
  res.json({ success: true, data: 'Freelancer data here' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});