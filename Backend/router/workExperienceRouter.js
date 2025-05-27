// workExperienceRouter.js
import express from 'express';
import * as workExperienceController from '../controller/workExperienceController.js';
import { uploadWorkExperienceImages } from '../config/multerConfig.js';

const router = express.Router();

// Get work experience for a freelancer
router.get('/retrieve', workExperienceController.getWorkExperience);

// Get single work experience entry
router.get('/single/:id', workExperienceController.getSingleWorkExperience);

// Create work experience
router.post('/create', uploadWorkExperienceImages.array('images', 5), workExperienceController.createWorkExperience);

// Update work experience
router.put('/update/:id', uploadWorkExperienceImages.array('images', 5), workExperienceController.updateWorkExperience);

// Delete work experience
router.delete('/delete/:id', workExperienceController.deleteWorkExperience);

// Get work experience for profile display (public)
router.get('/profile/:freelancerId', workExperienceController.getProfileWorkExperience);

// Set primary image
router.put('/set-primary-image/:imageId', workExperienceController.setPrimaryImage);

// Delete image
router.delete('/delete-image/:imageId', workExperienceController.deleteImage);

export const workExperienceRouter = router;
