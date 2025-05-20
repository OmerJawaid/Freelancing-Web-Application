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
const signup=async(req,res)=>{
   try{
      // Extract data from form
      const {Name, Email, Password, User_Type, Bio} = req.body;
      
      // Get profile image file if uploaded
      const profileImage = req.file;
      let imagePath = null;
      
      if (profileImage) {
         // Store the public URL path to the image
         imagePath = `/public/profileImages/${profileImage.filename}`;
         console.log(`Image path stored in database: ${imagePath}`);
      } else {
         // Set a default image path
         imagePath = `/public/profileImages/default-user.png`;
         
         // Copy default image if it doesn't exist
         const defaultImageSource = path.join(__dirname, '..', 'public', 'default-user.png');
         const defaultImageDest = path.join(publicImagesDir, 'default-user.png');
         
         if (!fs.existsSync(defaultImageDest) && fs.existsSync(defaultImageSource)) {
            fs.copyFileSync(defaultImageSource, defaultImageDest);
         } else if (!fs.existsSync(defaultImageDest)) {
            // Create a simple default image as fallback (not implemented)
            console.log("Default user image not found");
         }
      }
      
      if(!Email || !Password || !Name || !User_Type){
         return res.status(400).json({message:"Name, Email, Password or UserType is Empty"})
      }
      
      //Existing account(Email)
      const [existing]=await database_pool.query('Select * From user where Email=?', Email)
      if(existing.length>0){
         return res.status(409).json({message:"Email already Registered"})
      }

      //Bycrypting Password
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) {
        console.error("Salt generation error:", err);
        return;
    }
        bcrypt.hash(Password, salt, async function (err, hash) {
            if (err) {
            console.error("Hashing error:", err);
            return;
        }
       try {
            const [result] = await database_pool.query(
                'INSERT INTO user(Email, Password, created_at) VALUES (?, ?, ?)',
                [Email, hash, new Date()]
            );
            console.log("User created:", result);
        } catch (dbError) {
            console.error("Database error:", dbError);
        }
     });
    });
      
      //Registering New User
      if(User_Type=="freelancer"){
         try{
            // Include Bio field for freelancers if provided
            const [Freelancer_Rows] = await database_pool.query(
               'Insert INTO freelancers(Id, Name, bio, Image) VALUES(?,?,?,?)',
               [result.insertId, Name, Bio || null, imagePath]
         );
         }
         catch(err){
            console.error("Error creating freelancer profile:", err);
            return res.status(404).json({ message: err.message || "Error creating freelancer profile" });   
         }
      }
      else if(User_Type == "client"){
         const[Client_Rows]=await database_pool.query(
            'Insert INTO clients(Id, Name, Image) VALUES(?,?,?)',
            [result.insertId, Name, imagePath]
         );
      }
      else{
         return res.status(404).json({ message: "Invalid User Type"});
      }
      

      return res.status(201).json({
         Signup_Sucess: true, 
         message: "User created successfully", 
         userId: result.insertId
      });
   }
   catch(err){
      console.error("Signup error:", err);
      return res.status(500).json({ message: err.message || "An error occurred during signup" });
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