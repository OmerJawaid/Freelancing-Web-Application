
import express from 'express';
import { uploadMessages, retrieveMessages } from '../controller/Messages.js';

const messageRouter = express.Router();

messageRouter.post('/upload', uploadMessages);
messageRouter.get('/retrieve', retrieveMessages);

export { messageRouter };