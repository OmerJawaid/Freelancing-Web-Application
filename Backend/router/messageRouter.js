// messageRouter.js - Routes for message operations
import express from 'express';
import { uploadMessages, retrieveMessages } from '../controller/Messages.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Setup file storage configuration
 */
const setupFileStorage = () => {
  // Create path to the message attachments directory
  const messageAttachmentsDir = path.join(__dirname, '..', 'public', 'messageAttachments');

  // Ensure the directory exists
  if (!fs.existsSync(messageAttachmentsDir)) {
    fs.mkdirSync(messageAttachmentsDir, { recursive: true });
    console.log(`Created message attachments directory: ${messageAttachmentsDir}`);
  }

  // Configure multer storage
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, messageAttachmentsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'attachment-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

/**
 * Configure file type filter for uploads
 */
const fileFilter = (req, file, cb) => {
  // Accept image files and common document types
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
  const mimetype = file.mimetype.includes('image/') || 
                   file.mimetype.includes('application/pdf') ||
                   file.mimetype.includes('application/msword') ||
                   file.mimetype.includes('application/vnd.openxmlformats-officedocument') ||
                   file.mimetype.includes('text/plain');
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype || extname) {
    return cb(null, true);
  }
  cb(new Error("Only images and common document types are allowed!"));
};

// Initialize router
const messageRouter = express.Router();

// Initialize multer upload middleware
const upload = multer({ 
  storage: setupFileStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: fileFilter
});

// Define routes
messageRouter.post('/upload', upload.single('attachment'), uploadMessages);
messageRouter.get('/retrieve', retrieveMessages);

export { messageRouter };