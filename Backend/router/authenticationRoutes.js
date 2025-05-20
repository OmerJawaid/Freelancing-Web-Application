import express from 'express';
import { signup, login, logout, checkAuthentication, upload } from '../controller/Authentication.js';

const authenticationRouter = express.Router();

// Use multer middleware for file uploads on signup route
authenticationRouter.post('/signup', upload.single('profileImage'), signup);
authenticationRouter.post('/login', login);
authenticationRouter.post('/logout', logout);
authenticationRouter.get('/checkAuthentication', checkAuthentication);

export default authenticationRouter;