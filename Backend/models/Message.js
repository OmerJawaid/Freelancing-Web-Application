// models/Message.js
import { database_pool } from '../config/dbconnection.js';

/**
 * Message model class for handling message-related database operations
 */
export class Message {
  /**
   * Create a new message in the database
   * @param {Object} messageData - Message data to insert
   * @returns {Object} Result with insertId
   */
  static async create(messageData) {
    const { conversationId, senderId, content, attachmentUrl, type, status } = messageData;
    
    const query = `
      INSERT INTO messages 
      (Conversation_Id, Sender_Id, Content, Attachment_url, Type, Status)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    
    const result = await database_pool.query(query, [
      conversationId, 
      senderId, 
      content, 
      attachmentUrl, 
      type, 
      status || 'sent'
    ]);
    
    return result;
  }
  
  /**
   * Get all messages for a specific conversation
   * @param {number} conversationId - Conversation ID
   * @returns {Array} List of messages
   */
  static async getByConversationId(conversationId) {
    const [messages] = await database_pool.query(
      `SELECT * FROM messages 
       WHERE Conversation_Id = ? 
       ORDER BY Created_at ASC;`,
      [conversationId]
    );
    
    return messages;
  }
  
  /**
   * Mark messages as read
   * @param {number} conversationId - Conversation ID
   * @param {number} recipientId - Recipient user ID
   * @returns {Object} Query result
   */
  static async markAsRead(conversationId, recipientId) {
    const query = `
      UPDATE messages 
      SET Status = 'read' 
      WHERE Conversation_Id = ? 
        AND Sender_Id != ? 
        AND Status != 'read';
    `;
    
    const result = await database_pool.query(query, [conversationId, recipientId]);
    return result;
  }
  
  /**
   * Get the last message in a conversation
   * @param {number} conversationId - Conversation ID
   * @returns {Object|null} Last message or null
   */
  static async getLastMessage(conversationId) {
    const [messages] = await database_pool.query(
      `SELECT * FROM messages 
       WHERE Conversation_Id = ? 
       ORDER BY Created_at DESC 
       LIMIT 1;`,
      [conversationId]
    );
    
    return messages.length > 0 ? messages[0] : null;
  }
}
