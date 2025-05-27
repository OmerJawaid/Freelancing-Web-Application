// multerConfig.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create storage directories if they don't exist
const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Base uploads directory
const uploadsDir = path.join(__dirname, '..', 'assets');
createDirectoryIfNotExists(uploadsDir);

// Work experience images directory
const workExperienceDir = path.join(uploadsDir, 'workExperienceImages');
createDirectoryIfNotExists(workExperienceDir);

// Profile images directory
const profileImagesDir = path.join(uploadsDir, 'profileImages');
createDirectoryIfNotExists(profileImagesDir);

// Gig images directory
const gigImagesDir = path.join(uploadsDir, 'gigImages');
createDirectoryIfNotExists(gigImagesDir);

// Storage configuration for work experience images
const workExperienceStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, workExperienceDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'work-exp-' + uniqueSuffix + ext);
  }
});

// Storage configuration for profile images
const profileImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileImagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// Storage configuration for gig images
const gigImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, gigImagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'gig-' + uniqueSuffix + ext);
  }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed!'), false);
  }
};

// Configure multer for different upload types
export const uploadWorkExperienceImages = multer({ 
  storage: workExperienceStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB size limit
});

export const uploadProfileImage = multer({ 
  storage: profileImageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB size limit
});

export const uploadGigImages = multer({ 
  storage: gigImageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB size limit
});

// Helper functions to get URLs
export const getWorkExperienceImageUrl = (filename) => {
  if (!filename) return null;
  return `/workExperienceImages/${filename}`;
};

export const getProfileImageUrl = (filename) => {
  if (!filename) return null;
  return `/profileImages/${filename}`;
};

export const getGigImageUrl = (filename) => {
  if (!filename) return null;
  return `/gigImages/${filename}`;
};
