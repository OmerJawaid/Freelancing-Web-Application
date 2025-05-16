import express from 'express';
import {fetchPackagesByGigId} from'../controller/Packages.js';

const packageRouter=express.Router();

packageRouter.get('/retrieve',fetchPackagesByGigId);

export {packageRouter};