/**
 * MessagingFacade.js
 * 
 * Implements the Facade design pattern to simplify interactions with the messaging subsystem.
 * This facade encapsulates all message-related operations behind a simple interface,
 * hiding the complexity of database queries, notification creation, and conversation updates.
 */

import { database_pool } from '../config/dbconnection.js';
import { createNotification } from '../controller/Notification.js';

export class MessagingFacade {
    /**
     * Send a new message
     * @param {Object} messageData - Message data including conversation ID, sender ID, content
     * @param {Object} file - Optional file attachment
     * @returns {Object} Result object with message ID and status
     */
    static async sendMessage(messageData, file = null) {
        try {
            const { conversationId, senderId, content, type, status } = messageData;
            
            // Validate required fields
            if (!conversationId || !senderId) {
                throw new Error("Missing required fields");
            }
            
            // Process message data and attachment
            const processedData = this._processMessageData(messageData, file);
            
            // Store message in database
            const messageId = await this._saveMessageToDatabase(processedData);
            
            // Update conversation with last message info
            await this._updateConversation(processedData.conversationId, processedData.lastMessagePreview);
            
            // Create notification for recipient
            await this._notifyRecipient(processedData);
            
            // Return success response
            return {
                success: true,
                message: "Message sent successfully",
                messageId: messageId,
                attachmentUrl: processedData.attachmentUrl,
                type: processedData.type,
                lastMessagePreview: processedData.lastMessagePreview
            };
        } catch (error) {
            console.error("Error in MessagingFacade.sendMessage:", error);
            throw error;
        }
    }
    
    /**
     * Retrieve messages for a conversation
     * @param {string} conversationId - Conversation ID
     * @returns {Array} Array of messages
     */
    static async getMessages(conversationId) {
        try {
            // Validate conversation ID
            if (!conversationId) {
                throw new Error("Missing conversation ID");
            }
            
            // Fetch messages from database
            const [messages] = await database_pool.query(
                `SELECT * FROM messages 
                 WHERE Conversation_Id = ? 
                 ORDER BY Created_at ASC;`,
                [conversationId]
            );
            
            console.log(`Retrieved ${messages.length} messages for conversation ${conversationId}`);
            return messages;
        } catch (error) {
            console.error("Error in MessagingFacade.getMessages:", error);
            throw error;
        }
    }
    
    /**
     * Mark messages as read
     * @param {string} conversationId - Conversation ID
     * @param {string} userId - User ID marking messages as read
     * @returns {Object} Result with count of updated messages
     */
    static async markMessagesAsRead(conversationId, userId) {
        try {
            const [result] = await database_pool.query(
                `UPDATE messages 
                 SET Status = 'read' 
                 WHERE Conversation_Id = ? 
                 AND Sender_Id != ? 
                 AND Status != 'read';`,
                [conversationId, userId]
            );
            
            return {
                success: true,
                updatedCount: result.affectedRows
            };
        } catch (error) {
            console.error("Error in MessagingFacade.markMessagesAsRead:", error);
            throw error;
        }
    }
    
    /**
     * Delete a message
     * @param {string} messageId - Message ID
     * @param {string} userId - User ID of requester (for authorization)
     * @returns {Object} Result with success status
     */
    static async deleteMessage(messageId, userId) {
        try {
            // Check if user is authorized to delete message
            const [message] = await database_pool.query(
                `SELECT * FROM messages WHERE Id = ?`,
                [messageId]
            );
            
            if (!message || message.length === 0) {
                throw new Error("Message not found");
            }
            
            if (message[0].Sender_Id != userId) {
                throw new Error("Unauthorized to delete this message");
            }
            
            // Soft delete by updating status
            const [result] = await database_pool.query(
                `UPDATE messages SET Status = 'deleted' WHERE Id = ?`,
                [messageId]
            );
            
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0 ? "Message deleted" : "Failed to delete message"
            };
        } catch (error) {
            console.error("Error in MessagingFacade.deleteMessage:", error);
            throw error;
        }
    }
    
    // PRIVATE HELPER METHODS
    
    /**
     * Process message data and file attachments
     * @private
     * @param {Object} messageData - Message data
     * @param {Object} file - File attachment object
     * @returns {Object} Processed message data
     */
    static _processMessageData(messageData, file) {
        const { conversationId, senderId, content, type } = messageData;
        
        let attachmentUrl = null;
        let messageType = type || 'text';
        let messageContent = content || '';
        let lastMessagePreview = messageContent;
        
        // Handle attachment if present
        if (file) {
            attachmentUrl = `/public/messageAttachments/${file.filename}`;
            
            if (file.mimetype.includes('image/')) {
                messageType = 'image';
                if (!messageContent) lastMessagePreview = 'Sent an image';
            } else {
                messageType = 'file';
                if (!messageContent) lastMessagePreview = 'Sent a file';
            }
        }
        
        return {
            conversationId,
            senderId,
            content: messageContent,
            attachmentUrl,
            type: messageType,
            status: messageData.status || 'sent',
            lastMessagePreview
        };
    }
    
    /**
     * Save message to database
     * @private
     * @param {Object} data - Processed message data
     * @returns {number} Message ID
     */
    static async _saveMessageToDatabase(data) {
        const query = `
            INSERT INTO messages 
            (Conversation_Id, Sender_Id, Content, Attachment_url, Type, Status)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        
        const [result] = await database_pool.query(query, [
            data.conversationId,
            data.senderId,
            data.content,
            data.attachmentUrl,
            data.type,
            data.status
        ]);
        
        if (!result || result.affectedRows === 0) {
            throw new Error("Failed to save message to database");
        }
        
        return result.insertId;
    }
    
    /**
     * Update conversation with last message info
     * @private
     * @param {string} conversationId - Conversation ID
     * @param {string} lastMessage - Preview of the last message
     */
    static async _updateConversation(conversationId, lastMessage) {
        const query = `
            UPDATE conversations 
            SET Last_message = ?, 
                Last_message_time = NOW() 
            WHERE Id = ?
        `;
        
        await database_pool.query(query, [lastMessage, conversationId]);
    }
    
    /**
     * Create notification for message recipient
     * @private
     * @param {Object} data - Processed message data
     */
    static async _notifyRecipient(data) {
        const [conversation] = await database_pool.query(
            `SELECT * FROM conversations WHERE Id = ?`,
            [data.conversationId]
        );
        
        if (conversation && conversation.length > 0) {
            const conv = conversation[0];
            const receiverId = conv.User_one_id === parseInt(data.senderId) ? 
                conv.User_two_id : conv.User_one_id;
            
            // Create notification
            await createNotification(
                receiverId,
                'message',
                'New Message',
                data.lastMessagePreview,
                data.conversationId
            );
        }
    }
}

export default MessagingFacade;
