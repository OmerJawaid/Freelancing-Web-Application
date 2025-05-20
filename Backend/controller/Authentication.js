//Authenticaion.js
import { database_pool } from "../config/dbconnection.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

//Hashing Password
import bcrypt from 'bcrypt';
const saltRounds = 10;

// Get current dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a path to the public images directory
const publicImagesDir = path.join(__dirname, '..', 'public', 'profileImages');

// Ensure the public directory exists
if (!fs.existsSync(publicImagesDir)) {
   fs.mkdirSync(publicImagesDir, { recursive: true });
   console.log(`Created public images directory: ${publicImagesDir}`);
}

// Configure multer storage for profile images
const storage = multer.diskStorage({
   destination: function(req, file, cb) {
      // Store directly in the public directory
      cb(null, publicImagesDir);
   },
   filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
   }
});

export const upload = multer({ 
   storage: storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
   fileFilter: function(req, file, cb) {
      // Accept only image files
      const filetypes = /jpeg|jpg|png|gif/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      
      if (mimetype && extname) {
         return cb(null, true);
      }
      cb(new Error("Only image files are allowed!"));
   }
});

//Registering a new user: Inserting data into table user
const signup = async (req, res) => {
   try {
      console.log('Starting signup process...');
      // Extract data from form
      const { Name, Email, Password, User_Type, Bio } = req.body;
      console.log('Received signup data:', { Name, Email, User_Type, Bio: Bio ? 'provided' : 'not provided' });
      
      // Get profile image file if uploaded
      const profileImage = req.file;
      let imagePath = null;
      
      if (profileImage) {
         imagePath = `/public/profileImages/${profileImage.filename}`;
         console.log('Profile image uploaded:', imagePath);
      } else {
         imagePath = `/public/profileImages/default-user.png`;
         console.log('Using default profile image');
         
         const defaultImageSource = path.join(__dirname, '..', 'public', 'default-user.png');
         const defaultImageDest = path.join(publicImagesDir, 'default-user.png');
         
         if (!fs.existsSync(defaultImageDest) && fs.existsSync(defaultImageSource)) {
            fs.copyFileSync(defaultImageSource, defaultImageDest);
            console.log('Default image copied successfully');
         } else if (!fs.existsSync(defaultImageDest)) {
            console.log("Warning: Default user image not found");
         }
      }
      
      if (!Email || !Password || !Name || !User_Type) {
         console.log('Validation failed:', { Email: !!Email, Password: !!Password, Name: !!Name, User_Type: !!User_Type });
         return res.status(400).json({ message: "Name, Email, Password or UserType is Empty" });
      }
      
      // Check for existing account
      console.log('Checking for existing account...');
      const [existing] = await database_pool.query('Select * From user where Email=?', Email);
      if (existing.length > 0) {
         console.log('Email already registered:', Email);
         return res.status(409).json({ message: "Email already Registered" });
      }

      // Hash password and create user in a single async operation
      console.log('Hashing password...');
      let hash;
      try {
         hash = await new Promise((resolve, reject) => {
            bcrypt.hash(Password, saltRounds, (err, hash) => {
               if (err) {
                  console.error('Password hashing error:', err);
                  reject(err);
               } else {
                  resolve(hash);
               }
            });
         });
         console.log('Password hashed successfully');
      } catch (hashError) {
         console.error('Failed to hash password:', hashError);
         throw new Error('Failed to process password');
      }

      // Create user record
      console.log('Creating user record...');
      let result;
      try {
         [result] = await database_pool.query(
            'INSERT INTO user(Email, Password, created_at) VALUES (?, ?, ?)',
            [Email, hash, new Date()]
         );
         console.log('User record created successfully:', result.insertId);
      } catch (dbError) {
         console.error('Failed to create user record:', dbError);
         throw new Error('Failed to create user account');
      }

      // Create profile based on user type
      console.log('Creating user profile...');
      try {
         if (User_Type === "freelancer") {
            await database_pool.query(
               'Insert INTO freelancers(Id, Name, bio, Image) VALUES(?,?,?,?)',
               [result.insertId, Name, Bio || null, imagePath]
            );
            console.log('Freelancer profile created successfully');
         } else if (User_Type === "client") {
            await database_pool.query(
               'Insert INTO clients(Id, Name, Image) VALUES(?,?,?)',
               [result.insertId, Name, imagePath]
            );
            console.log('Client profile created successfully');
         } else {
            console.log('Invalid user type:', User_Type);
            return res.status(404).json({ message: "Invalid User Type" });
         }
      } catch (profileError) {
         console.error('Failed to create user profile:', profileError);
         // If profile creation fails, we should clean up the user record
         try {
            await database_pool.query('DELETE FROM user WHERE id = ?', [result.insertId]);
            console.log('Cleaned up user record after profile creation failure');
         } catch (cleanupError) {
            console.error('Failed to clean up user record:', cleanupError);
         }
         throw new Error('Failed to create user profile');
      }

      console.log('Signup process completed successfully');
      return res.status(201).json({
         Signup_Success: true,
         message: "User created successfully",
         userId: result.insertId
      });
   } catch (err) {
      console.error("Signup process failed:", err);
      // Check if this is a known error with a specific message
      if (err.message === 'Failed to process password' || 
          err.message === 'Failed to create user account' || 
          err.message === 'Failed to create user profile') {
         return res.status(500).json({ 
            message: err.message,
            details: "Please try again. If the problem persists, contact support."
         });
      }
      return res.status(500).json({ 
         message: "An error occurred during signup",
         details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
   }
}

// Login route
const login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        if (!Email || !Password) {
            return res.status(400).json({
                Authenticate: false,
                message: "Email and password are required"
            });
        }

        const [users] = await database_pool.query(`
            SELECT 
                u.*,
                COALESCE(f.Name, c.Name) as Name,
                COALESCE(f.Image, c.Image) AS Image,
                CASE 
                    WHEN f.Id IS NOT NULL THEN 'freelancer'
                    WHEN c.Id IS NOT NULL THEN 'client'
                END as User_Type
            FROM user u
            LEFT JOIN freelancers f ON u.id = f.Id
            LEFT JOIN clients c ON u.id = c.Id
            WHERE u.Email = ?
        `, [Email]);

        if (users.length === 0) {
            return res.status(401).json({
                Authenticate: false,
                message: "Invalid email or password"
            });
        }
       

        const user = users[0];
        const match = await bcrypt.compare(Password, user.Password);

        if(!match){
            return res.status(401).json({
                Authenticate: false,
                message: "Invalid email or password"
            });
        }

        // Set session data
        req.session.user = {
            id: user.id,
            email: user.Email,
            name: user.Name,
            User_Type: user.User_Type,
            Image: user.Image
        };

        // Save session
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({
                    Authenticate: false,
                    message: "Error saving session"
                });
            }

            return res.status(200).json({
                Authenticate: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    email: user.Email,
                    name: user.Name,
                    User_Type: user.User_Type,
                    Image: user.Image
                }
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            Authenticate: false,
            message: "An error occurred during login"
        });
    }
};

// Check authentication status
const checkAuthentication=(req, res) => {
    if (req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({ authenticated: false });
    }
}

// Logout route
const logout=(req, res) => {
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
}

export {signup,login,logout,checkAuthentication}