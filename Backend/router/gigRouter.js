import express from 'express';
import {fetchGig,fetchGigByFreelancerIdForGigDisplay,fetchGigByGigId,fetchGigForFreelancer, updateGigViews, toggleGigState, createGig, updateGig} from "../controller/Gig.js";
import { uploadGigImages } from '../config/multerConfig.js';

const gigRouter=express.Router();
gigRouter.get('/retrieveAllGigs',fetchGig)
gigRouter.get('/retrieveGigForGigDisplay',fetchGigByFreelancerIdForGigDisplay)
gigRouter.get('/retrieveGigByGigId',fetchGigByGigId)
gigRouter.get('/retrieveGigForFreelancer',fetchGigForFreelancer)
gigRouter.put('/updateViews/:gigId', updateGigViews);
gigRouter.put('/toggleState/:gigId', toggleGigState);
gigRouter.post('/createGig', uploadGigImages.single('image'), createGig);
gigRouter.put('/updateGig/:gigId', uploadGigImages.single('image'), updateGig);

export  {gigRouter};