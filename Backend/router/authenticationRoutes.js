
import express from 'express';
import { signup, login,logout,checkAuthentication } from '../controller/Authentication.js';

const authenticationRouter = express.Router();

authenticationRouter.post('/signup', signup);
authenticationRouter.post('/login', login);
authenticationRouter.get('/checkAuthentication',checkAuthentication);
authenticationRouter.post('/logout',logout);

export { authenticationRouter };