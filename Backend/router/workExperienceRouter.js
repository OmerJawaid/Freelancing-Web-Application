// workExperienceRouter.js - Router for work experience management
import express from 'express';
import { 
  addWorkExperience, 
  updateWorkExperience, 
  deleteWorkExperience, 
  getWorkExperienceById,
  getWorkExperienceByFreelancer,
  uploadWorkExperienceImages,
  deleteWorkExperienceImage,
  setPrimaryImage
} from '../controller/workExperienceController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create work experience images directory if it doesn't exist
const workExperienceImagesDir = path.join(__dirname, '../assets/workExperienceImages');
if (!fs.existsSync(workExperienceImagesDir)) {
  fs.mkdirSync(workExperienceImagesDir, { recursive: true });
}

// Configure storage for work experience images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, workExperienceImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'work-exp-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Initialize upload middleware
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const workExperienceRouter = express.Router();

// Get work experience by freelancer ID
workExperienceRouter.get('/freelancer/:freelancerId', getWorkExperienceByFreelancer);

// Get specific work experience by ID
workExperienceRouter.get('/:id', getWorkExperienceById);

// Add new work experience
workExperienceRouter.post('/add', addWorkExperience);

// Update existing work experience
workExperienceRouter.put('/update/:id', updateWorkExperience);

// Delete work experience
workExperienceRouter.delete('/delete/:id', deleteWorkExperience);

// Upload work experience images
workExperienceRouter.post('/upload-images/:workExperienceId', upload.array('images', 5), uploadWorkExperienceImages);

// Delete work experience image
workExperienceRouter.delete('/delete-image/:imageId', deleteWorkExperienceImage);

// Set primary image
workExperienceRouter.put('/set-primary-image/:imageId', setPrimaryImage);

export { workExperienceRouter };
