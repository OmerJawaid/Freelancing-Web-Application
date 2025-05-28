import express from 'express';
import {fetchGig,fetchGigByFreelancerIdForGigDisplay,fetchGigByGigId,fetchGigForFreelancer, updateGigViews, toggleGigState, createGig, updateGig} from "../controller/Gig.js";
import { uploadGigImages } from '../config/multerConfig.js';
import { verifyToken, isFreelancer } from '../middleware/authMiddleware.js';

const gigRouter=express.Router();
gigRouter.get('/retrieveAllGigs',fetchGig)
gigRouter.get('/retrieveGigForGigDisplay',fetchGigByFreelancerIdForGigDisplay)
gigRouter.get('/retrieveGigByGigId',fetchGigByGigId)
gigRouter.get('/retrieveGigForFreelancer',fetchGigForFreelancer)
gigRouter.put('/updateViews/:gigId', updateGigViews);
gigRouter.put('/toggleState/:gigId', toggleGigState);
// CRITICAL FIX: Put multer (uploadGigImages) BEFORE authentication middleware
// This ensures the form is parsed first, making form fields (including the token) available
// to the authentication middleware before verification
gigRouter.post('/createGig', uploadGigImages.single('image'), verifyToken, isFreelancer, createGig);
gigRouter.put('/updateGig/:gigId', verifyToken, isFreelancer, uploadGigImages.single('image'), updateGig);

export  {gigRouter};