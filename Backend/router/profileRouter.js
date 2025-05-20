// profileRouter.js
import express from 'express';
import { upload, updateProfile, updatePassword } from '../controller/Profile.js';

const profileRouter = express.Router();

// Update profile route (with middleware for file upload)
profileRouter.put('/updateProfile', upload.single('profileImage'), updateProfile);

// Update password route
profileRouter.put('/updatePassword', updatePassword);

export default profileRouter; 