
import express from 'express';
import { createConversation,retriveConversation } from '../controller/Conversation.js';


const conversationRouter = express.Router();

conversationRouter.post('/create', createConversation);
conversationRouter.get('/retrieve', retriveConversation);

export { conversationRouter };