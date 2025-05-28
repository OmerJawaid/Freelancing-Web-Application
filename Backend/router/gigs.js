import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { database_pool } from '../config/dbconnection.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// Ensure upload directories exist
const uploadDir = 'public/uploads/gigs';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gig-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Routes
router.post('/createGig', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { Title, Description, Category, packages } = req.body;
    const freelancerId = req.user.id;

    // Validate required fields
    if (!Title || !Description || !Category || !packages) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let parsedPackages;
    try {
      parsedPackages = typeof packages === 'string' ? JSON.parse(packages) : packages;
    } catch (err) {
      return res.status(400).json({ message: "Invalid package data format" });
    }

    // Get the image path
    const imagePath = req.file 
      ? `/uploads/gigs/${req.file.filename}`
      : '/uploads/gigs/default-gig.jpg';

    // Start transaction
    const connection = await database_pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert gig
      const [gigResult] = await connection.query(
        'INSERT INTO gigs (Freelancer_Id, Title, Description, Category, Image, State, Views) VALUES (?, ?, ?, ?, ?, 1, 0)',
        [freelancerId, Title, Description, Category, imagePath]
      );

      const gigId = gigResult.insertId;

      // Insert packages
      for (const pkg of parsedPackages) {
        if (!pkg.Type || !pkg.Price || !pkg.Delivery_Time || !pkg.Package_Details) {
          throw new Error('Invalid package data: ' + JSON.stringify(pkg));
        }

        await connection.query(
          'INSERT INTO packages (Gig_Id, Price, Delivery_Time, Package_Details, Type) VALUES (?, ?, ?, ?, ?)',
          [gigId, pkg.Price, pkg.Delivery_Time, pkg.Package_Details, pkg.Type]
        );
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: "Gig created successfully!",
        gigId,
        imagePath
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error in createGig:', error);
    res.status(500).json({
      message: "Failed to create gig",
      error: error.message
    });
  }
}); 