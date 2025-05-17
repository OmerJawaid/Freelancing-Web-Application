import express from'express';
import {fetchGig,fetchGigByFreelancerIdForGigDisplay,fetchGigByGigId,fetchGigForFreelancer, updateGigViews, toggleGigState, createGig, updateGig} from "../controller/Gig.js";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // **WARNING**: Saving files directly to the frontend public directory is not a standard or recommended practice.
        // This can have security and deployment implications. Proceed with caution.
        const frontendPublicDir = path.join(__dirname, '../../Frontend/public/assets/gigImages');
        cb(null, frontendPublicDir); // Save images to Frontend/public/assets/gigImages
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const gigRouter=express.Router();
gigRouter.get('/retrieveAllGigs',fetchGig)
gigRouter.get('/retrieveGigForGigDisplay',fetchGigByFreelancerIdForGigDisplay)
gigRouter.get('/retrieveGigByGigId',fetchGigByGigId)
gigRouter.get('/retrieveGigForFreelancer',fetchGigForFreelancer)
gigRouter.put('/updateViews/:gigId', updateGigViews);
gigRouter.put('/toggleState/:gigId', toggleGigState);
gigRouter.post('/createGig', upload.single('image'), createGig);
gigRouter.put('/updateGig/:gigId', upload.single('image'), updateGig);

export  {gigRouter};