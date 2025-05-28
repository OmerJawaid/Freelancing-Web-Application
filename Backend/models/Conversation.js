// models/Conversation.js
import { database_pool } from '../config/dbconnection.js';

/**
 * Conversation model class for handling conversation-related database operations
 */
export class Conversation {
  /**
   * Create a new conversation between two users
   * @param {number} userOneId - First user ID
   * @param {number} userTwoId - Second user ID
   * @returns {Object} Result with insertId
   */
  static async create(userOneId, userTwoId) {
    const query = `
      INSERT INTO conversations 
      (User_one_id, User_two_id, Last_message, Last_message_time)
      VALUES (?, ?, '', NOW());
    `;
    
    const result = await database_pool.query(query, [userOneId, userTwoId]);
    return result;
  }
  
  /**
   * Find a conversation by ID
   * @param {number} conversationId - Conversation ID
   * @returns {Object|null} Conversation or null
   */
  static async findById(conversationId) {
    const [conversations] = await database_pool.query(
      `SELECT * FROM conversations WHERE Id = ?`,
      [conversationId]
    );
    
    return conversations.length > 0 ? conversations[0] : null;
  }
  
  /**
   * Find a conversation between two users
   * @param {number} userOneId - First user ID
   * @param {number} userTwoId - Second user ID
   * @returns {Object|null} Conversation or null
   */
  static async findByUsers(userOneId, userTwoId) {
    const [conversations] = await database_pool.query(
      `SELECT * FROM conversations 
       WHERE (User_one_id = ? AND User_two_id = ?)
          OR (User_one_id = ? AND User_two_id = ?)`,
      [userOneId, userTwoId, userTwoId, userOneId]
    );
    
    return conversations.length > 0 ? conversations[0] : null;
  }
  
  /**
   * Get all conversations for a user
   * @param {number} userId - User ID
   * @returns {Array} List of conversations
   */
  static async getByUserId(userId) {
    const [conversations] = await database_pool.query(
      `SELECT c.*, 
              u1.Name as user_one_name, u1.Image as user_one_image,
              u2.Name as user_two_name, u2.Image as user_two_image
       FROM conversations c
       JOIN users u1 ON c.User_one_id = u1.id
       JOIN users u2 ON c.User_two_id = u2.id
       WHERE c.User_one_id = ? OR c.User_two_id = ?
       ORDER BY c.Last_message_time DESC`,
      [userId, userId]
    );
    
    return conversations;
  }
  
  /**
   * Update last message and timestamp for a conversation
   * @param {number} conversationId - Conversation ID
   * @param {string} lastMessage - Last message content
   * @returns {Object} Query result
   */
  static async updateLastMessage(conversationId, lastMessage) {
    const query = `
      UPDATE conversations 
      SET Last_message = ?, 
          Last_message_time = NOW() 
      WHERE Id = ?
    `;
    
    const result = await database_pool.query(query, [lastMessage, conversationId]);
    return result;
  }
  
  /**
   * Update unread count for a user in a conversation
   * @param {number} conversationId - Conversation ID
   * @param {number} userId - User ID
   * @param {number} increment - Value to increment unread count by
   * @returns {Object} Query result
   */
  static async updateUnreadCount(conversationId, userId, increment = 1) {
    const conversation = await this.findById(conversationId);
    if (!conversation) return null;
    
    const isUserOne = conversation.User_one_id === userId;
    const fieldToUpdate = isUserOne ? 'unread_count_user_one' : 'unread_count_user_two';
    
    const query = `
      UPDATE conversations 
      SET ${fieldToUpdate} = ${fieldToUpdate} + ? 
      WHERE Id = ?
    `;
    
    const result = await database_pool.query(query, [increment, conversationId]);
    return result;
  }
  
  /**
   * Reset unread count for a user in a conversation
   * @param {number} conversationId - Conversation ID
   * @param {number} userId - User ID
   * @returns {Object} Query result
   */
  static async resetUnreadCount(conversationId, userId) {
    const conversation = await this.findById(conversationId);
    if (!conversation) return null;
    
    const isUserOne = conversation.User_one_id === userId;
    const fieldToReset = isUserOne ? 'unread_count_user_one' : 'unread_count_user_two';
    
    const query = `
      UPDATE conversations 
      SET ${fieldToReset} = 0 
      WHERE Id = ?
    `;
    
    const result = await database_pool.query(query, [conversationId]);
    return result;
  }
}
