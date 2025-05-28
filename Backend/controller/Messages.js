//Messages
import dotenv from 'dotenv';
dotenv.config();
import { createNotification } from './Notification.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';

/**
 * Upload a new message and attachment to the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadMessages = async (req, res) => {
    try {
        const { Conversation_Id, Sender_Id, Content, Type, Status } = req.body;
        
        // Validate required fields
        if (!Conversation_Id || !Sender_Id) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Process message data
        const messageData = processMessageData(req);
        
        // Insert message into database using Message model
        const result = await Message.create({
            conversationId: Conversation_Id, 
            senderId: Sender_Id, 
            content: messageData.content, 
            attachmentUrl: messageData.attachmentUrl, 
            type: messageData.type, 
            status: Status || 'sent'
        });

        if (!result || result.affectedRows === 0) {
            return res.status(500).json({ success: false, message: "Failed to send message" });
        }

        // Update conversation with last message info using Conversation model
        await Conversation.updateLastMessage(Conversation_Id, messageData.lastMessagePreview);

        // Get conversation details to identify recipient
        const conversation = await Conversation.findById(Conversation_Id);
        
        if (conversation) {
            const receiverId = conversation.User_one_id === parseInt(Sender_Id) 
                ? conversation.User_two_id 
                : conversation.User_one_id;
            
            // Create notification
            await createNotification(
                receiverId,
                'message',
                'New Message',
                messageData.lastMessagePreview,
                Conversation_Id
            );
            
            // Increment unread count for recipient
            await Conversation.updateUnreadCount(Conversation_Id, receiverId);
        }
        
        // Return success response
        res.status(200).json({
            success: true,
            message: "Message sent successfully", 
            messageId: result.insertId,
            attachmentUrl: messageData.attachmentUrl,
            type: messageData.type,
            lastMessagePreview: messageData.lastMessagePreview
        });
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
 * Process message data and file attachments
 * @param {Object} req - Express request object
 * @returns {Object} Processed message data
 */
function processMessageData(req) {
    const { Content, Type } = req.body;
    
    let attachmentUrl = null;
    let messageType = Type || 'text';
    let messageContent = Content || '';
    let lastMessagePreview = messageContent;

    // Handle attachment if present
    if (req.file) {
        attachmentUrl = `/public/messageAttachments/${req.file.filename}`;
        
        if (req.file.mimetype.includes('image/')) {
            messageType = 'image';
            if (!messageContent) lastMessagePreview = 'Sent an image';
        } else {
            messageType = 'file';
            if (!messageContent) lastMessagePreview = 'Sent a file';
        }
    }

    return {
        content: messageContent,
        attachmentUrl,
        type: messageType,
        lastMessagePreview
    };
}

/**
 * Update conversation's last message and timestamp
 * @param {string} conversationId - Conversation ID
 * @param {string} lastMessage - Preview of the last message
 */
// This function is no longer needed as it's moved to the Conversation model
// Keeping a reference to the model implementation for clarity
async function updateConversationLastMessage(conversationId, lastMessage) {
    // This functionality is now implemented in Conversation.updateLastMessage()
    await Conversation.updateLastMessage(conversationId, lastMessage);
}

/**
 * Retrieve messages for a specific conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const retrieveMessages = async (req, res) => {
    try {
        const { conversation_id, user_id } = req.query;
        
        // Validate conversation ID
        if (!conversation_id) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing conversation ID" 
            });
        }

        // Fetch messages using the Message model
        const messages = await Message.getByConversationId(conversation_id);
        
        // If user_id is provided, mark messages as read for this user
        if (user_id) {
            await Message.markAsRead(conversation_id, user_id);
            
            // Also reset unread count for this user
            await Conversation.resetUnreadCount(conversation_id, user_id);
        }
        
        console.log(`Retrieved ${messages.length} messages for conversation ${conversation_id}`);
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

export { uploadMessages, retrieveMessages };
