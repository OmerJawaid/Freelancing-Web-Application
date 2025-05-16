import express from 'express';
import { fetchReviewsByGigId } from '../controller/Reviews.js';

const reviewRouter=express.Router();
reviewRouter.get('/retrieve',fetchReviewsByGigId);

export {reviewRouter};