//Messages
import dotenv from 'dotenv';
dotenv.config();
import { MessagingFacade } from '../utils/MessagingFacade.js';

/**
 * Upload a new message and attachment to the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadMessages = async (req, res) => {
    try {
        const { Conversation_Id, Sender_Id, Content, Type, Status } = req.body;
        
        // Use the MessagingFacade to handle all the message sending operations
        const result = await MessagingFacade.sendMessage({
            conversationId: Conversation_Id,
            senderId: Sender_Id,
            content: Content,
            type: Type,
            status: Status
        }, req.file);
        
        // Return success response
        res.status(200).json(result);
    } catch (err) {
        console.error("Error saving message:", err);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error", 
            error: err.message 
        });
    }
};





/**
 * Retrieve messages for a specific conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const retrieveMessages = async (req, res) => {
    try {
        const { conversation_id } = req.query;
        
        // Use the MessagingFacade to retrieve messages
        const messages = await MessagingFacade.getMessages(conversation_id);
        
        return res.status(200).json(messages);
    } catch (err) {
        console.error("Error retrieving messages:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve messages", 
            error: err.message 
        });
    }
};
/**
 * Mark all messages in a conversation as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAsRead = async (req, res) => {
    try {
        const { conversation_id, user_id } = req.body;
        
        // Use the MessagingFacade to mark messages as read
        const result = await MessagingFacade.markMessagesAsRead(conversation_id, user_id);
        
        return res.status(200).json(result);
    } catch (err) {
        console.error("Error marking messages as read:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to mark messages as read", 
            error: err.message 
        });
    }
};

/**
 * Delete a message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMessage = async (req, res) => {
    try {
        const { message_id, user_id } = req.body;
        
        // Use the MessagingFacade to delete message
        const result = await MessagingFacade.deleteMessage(message_id, user_id);
        
        return res.status(200).json(result);
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ 
            success: false, 
            message: err.message, 
            error: err.message 
        });
    }
};

export { uploadMessages, retrieveMessages, markAsRead, deleteMessage };
