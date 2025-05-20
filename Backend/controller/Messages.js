//Messages
import dotenv from 'dotenv';
dotenv.config();
import { database_pool } from '../config/dbconnection.js';

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
        
        // Insert message into database
        const query = `
            INSERT INTO messages 
            (Conversation_Id, Sender_Id, Content, Attachment_url, Type, Status)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        
        const result = await database_pool.query(query, [
            Conversation_Id, 
            Sender_Id, 
            messageData.content, 
            messageData.attachmentUrl, 
            messageData.type, 
            Status || 'sent'
        ]);

        if (!result || result.affectedRows === 0) {
            return res.status(500).json({ success: false, message: "Failed to send message" });
        }

        // Update conversation with last message info
        await updateConversationLastMessage(Conversation_Id, messageData.lastMessagePreview);

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
async function updateConversationLastMessage(conversationId, lastMessage) {
    const query = `
        UPDATE conversations 
        SET Last_message = ?, 
            Last_message_time = NOW() 
        WHERE Id = ?
    `;
    
    await database_pool.query(query, [lastMessage, conversationId]);
}

/**
 * Retrieve messages for a specific conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const retrieveMessages = async (req, res) => {
    try {
        const { conversation_id } = req.query;
        
        // Validate conversation ID
        if (!conversation_id) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing conversation ID" 
            });
        }

        // Fetch messages from database
        const [messages] = await database_pool.query(
            `SELECT * FROM skillify.messages 
             WHERE Conversation_Id = ? 
             ORDER BY Created_at ASC;`,
            [conversation_id]
        );
        
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
