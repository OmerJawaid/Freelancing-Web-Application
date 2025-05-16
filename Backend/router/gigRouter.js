import express from'express';
import {fetchGig,fetchGigByFreelancerIdForGigDisplay,fetchGigByGigId,fetchGigForFreelancer} from "../controller/Gig.js";

const gigRouter=express.Router();
gigRouter.get('/retrieveAllGigs',fetchGig)
gigRouter.get('/retrieveGigForGigDisplay',fetchGigByFreelancerIdForGigDisplay)
gigRouter.get('/retrieveGigByGigId',fetchGigByGigId)
gigRouter.get('/retrieveGigForFreelancer',fetchGigForFreelancer)

export  {gigRouter};