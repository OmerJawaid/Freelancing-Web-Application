import { database_pool } from "../config/dbconnection.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public', 'profileImages');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Update user profile (name, bio, image)
export const updateProfile = async (req, res) => {
  try {
    const { Name, Bio, User_Type, Id } = req.body;
    
    if (!Name || !User_Type || !Id) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }
    
    // Image path to store in DB
    let imagePath = null;
    if (req.file) {
      imagePath = `/public/profileImages/${req.file.filename}`;
    }
    
    // Update the appropriate table based on user type
    if (User_Type === 'freelancer') {
      // Update freelancer table
      const updateQuery = imagePath 
        ? 'UPDATE freelancers SET Name = ?, bio = ?, Image = ? WHERE Id = ?' 
        : 'UPDATE freelancers SET Name = ?, bio = ? WHERE Id = ?';
      
      const updateParams = imagePath 
        ? [Name, Bio || null, imagePath, Id] 
        : [Name, Bio || null, Id];
      
      await database_pool.query(updateQuery, updateParams);
    } 
    else if (User_Type === 'client') {
      // Update client table
      const updateQuery = imagePath 
        ? 'UPDATE clients SET Name = ?, Image = ? WHERE Id = ?' 
        : 'UPDATE clients SET Name = ? WHERE Id = ?';
      
      const updateParams = imagePath 
        ? [Name, imagePath, Id] 
        : [Name, Id];
      
      await database_pool.query(updateQuery, updateParams);
    } 
    else {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user type" 
      });
    }
    
    return res.status(200).json({ 
      success: true,
      message: "Profile updated successfully" 
    });
  } 
  catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ 
      success: false,
      message: "An error occurred while updating the profile",
      error: error.message 
    });
  }
};

// Update password
// Get freelancer profile by ID
export const getFreelancerProfile = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    
    if (!freelancerId) {
      return res.status(400).json({
        success: false,
        message: "Freelancer ID is required"
      });
    }

    // Query to get freelancer data combining user and freelancer tables
    const [rows] = await database_pool.query(
      `SELECT u.id, u.Email, u.User_Type, u.Image, 
              f.Name, f.bio, f.Rating
       FROM user u
       LEFT JOIN freelancers f ON u.id = f.Id
       WHERE u.id = ? AND u.User_Type = 'freelancer'`,
      [freelancerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found"
      });
    }

    // Get completed orders count
    const [orderRows] = await database_pool.query(
      `SELECT COUNT(*) as completedOrdersCount 
       FROM orders 
       WHERE Freelancer_Id = ? AND Status = 'completed'`,
      [freelancerId]
    );

    const completedOrdersCount = orderRows[0].completedOrdersCount || 0;

    // Format the response
    const freelancer = {
      ...rows[0],
      completedOrdersCount
    };

    return res.status(200).json({
      success: true,
      freelancer
    });
  } catch (error) {
    console.error('Error fetching freelancer profile:', error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching freelancer profile"
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;
    
    if (!currentPassword || !newPassword || !userId) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }
    
    // Verify current password
    const [users] = await database_pool.query(
      'SELECT Password FROM user WHERE id = ?', 
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    const user = users[0];
    
    // Check if current password matches
    if (user.Password !== currentPassword) {
      return res.status(401).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }
    
    // Update password
    await database_pool.query(
      'UPDATE user SET Password = ? WHERE id = ?', 
      [newPassword, userId]
    );
    
    return res.status(200).json({ 
      success: true,
      message: "Password updated successfully" 
    });
  } 
  catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ 
      success: false,
      message: "An error occurred while updating the password",
      error: error.message 
    });
  }
}; 