// Backend/server.js or index.js
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Add this for password hashing
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./config/database');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const gigsDir = path.join(uploadsDir, 'gigs');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

if (!fs.existsSync(gigsDir)) {
  fs.mkdirSync(gigsDir, { recursive: true });
  console.log('Created gigs directory');
}

const app = express();
const PORT = 8081;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'gigs');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'gig-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Gig Management Routes

// Retrieve gigs for a freelancer
app.get('/retrive-gigs', (req, res) => {
  const freelancerId = req.query.freelancer_Id;
  
  console.log('Retrieving gigs for freelancer ID:', freelancerId);
  
  if (!freelancerId) {
    return res.status(400).json({ success: false, message: 'Freelancer ID is required' });
  }
  
  // Use a simpler query first to check if it's a database connection issue
  const query = `SELECT * FROM gigs WHERE Freelancer_Id = ? ORDER BY Id DESC`;
  
  db.query(query, [freelancerId], (err, results) => {
    if (err) {
      console.error('Error retrieving gigs:', err);
      return res.status(500).json({ success: false, message: 'Server error when retrieving gigs' });
    }
    
    console.log('Gigs retrieved successfully:', results);
    res.json(results);
  });
});

// Add a new gig
app.post('/add-gig', upload.single('image'), (req, res) => {
  const { title, description, price, category, freelancerId } = req.body;
  
  if (!title || !description || !price || !category || !freelancerId) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }
  
  // Validate price is a positive number
  if (isNaN(price) || parseFloat(price) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number'
    });
  }
  
  // Default image path if no image is uploaded
  let imagePath = '/uploads/gigs/default-gig.jpg';
  
  // If file was uploaded, use its path
  if (req.file) {
    imagePath = `/uploads/gigs/${req.file.filename}`;
  }
  
  const query = `
    INSERT INTO gigs (
      Title, 
      Description, 
      Price, 
      Category, 
      Image, 
      Freelancer_Id,
      State,
      Creation_Date
    ) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
  `;
  
  db.query(
    query, 
    [title, description, price, category, imagePath, freelancerId], 
    (err, results) => {
      if (err) {
        console.error('Error adding gig:', err);
        // Check for foreign key constraint error
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({
            success: false,
            message: 'Invalid freelancer ID. User does not exist.'
          });
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to add gig' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Gig added successfully',
        gigId: results.insertId
      });
    }
  );
});

// Update gig status (active/paused)
app.put('/update-gig-status', (req, res) => {
  const { id, state } = req.body;
  
  if (!id || state === undefined) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gig ID and state are required' 
    });
  }
  
  const query = 'UPDATE gigs SET State = ? WHERE Id = ?';
  
  db.query(query, [state, id], (err, results) => {
    if (err) {
      console.error('Error updating gig status:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update gig status' 
      });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gig not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Gig status updated successfully' 
    });
  });
});

// Get a specific gig by ID
app.get('/gig/:id', (req, res) => {
  const gigId = req.params.id;
  
  const query = 'SELECT * FROM gigs WHERE Id = ?';
  
  db.query(query, [gigId], (err, results) => {
    if (err) {
      console.error('Error retrieving gig:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gig not found' 
      });
    }
    
    res.json({ 
      success: true, 
      gig: results[0] 
    });
  });
});

// Update gig information
app.put('/update-gig/:id', upload.single('image'), (req, res) => {
  const gigId = req.params.id;
  const { title, description, price, category } = req.body;
  
  if (!title || !description || !price || !category) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }
  
  // Start with base query without image
  let query = 'UPDATE gigs SET Title = ?, Description = ?, Price = ?, Category = ? WHERE Id = ?';
  let params = [title, description, price, category, gigId];
  
  // If a new image was uploaded, include it in the update
  if (req.file) {
    const imagePath = `/uploads/gigs/${req.file.filename}`;
    query = 'UPDATE gigs SET Title = ?, Description = ?, Price = ?, Category = ?, Image = ? WHERE Id = ?';
    params = [title, description, price, category, imagePath, gigId];
  }
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error updating gig:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update gig' 
      });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gig not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Gig updated successfully' 
    });
  });
});

// Delete a gig
app.delete('/delete-gig/:id', (req, res) => {
  const gigId = req.params.id;
  
  const query = 'DELETE FROM gigs WHERE Id = ?';
  
  db.query(query, [gigId], (err, results) => {
    if (err) {
      console.error('Error deleting gig:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete gig' 
      });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gig not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Gig deleted successfully' 
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});