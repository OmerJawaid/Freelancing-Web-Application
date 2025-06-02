/**
 * NotificationService.js
 * 
 * A simplified notification service that handles saving notifications to the database
 * and sending real-time notifications via WebSockets.
 */

import { database_pool } from '../config/dbconnection.js';

class NotificationService {
  /**
   * Send a notification to a user
   * @param {number} userId - The ID of the user to notify
   * @param {string} type - The type of notification (message, order, etc.)
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {number|null} relatedId - Optional related entity ID (e.g., conversation ID)
   * @returns {Promise<boolean>} - Success status
   */
  async sendNotification(userId, type, title, message, relatedId = null) {
    try {
      // Save to database first
      const notificationId = await this.saveToDatabase(userId, type, title, message, relatedId);
      
      // Send real-time notification via socket if available
      this.sendRealTimeNotification(userId, notificationId, type, title, message, relatedId);
      
      return true;
    } catch (err) {
      console.error("Error sending notification:", err);
      return false;
    }
  }
  
  /**
   * Save notification to database for record-keeping
   * @param {number} userId - The ID of the user
   * @param {string} type - The type of notification
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {number|null} relatedId - Optional related entity ID
   * @returns {Promise<number>} - The ID of the created notification
   */
  async saveToDatabase(userId, type, title, message, relatedId = null) {
    try {
      const [result] = await database_pool.query(
        `INSERT INTO notifications (User_Id, Type, Title, Message, Related_Id) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, type, title, message, relatedId]
      );
      
      return result.insertId;
    } catch (err) {
      console.error("Error saving notification to database:", err);
      return null;
    }
  }
  
  /**
   * Send a real-time notification via WebSocket
   * @param {number} userId - The ID of the user to notify
   * @param {number} notificationId - The ID of the notification in the database
   * @param {string} type - The type of notification
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {number|null} relatedId - Optional related entity ID
   */
  sendRealTimeNotification(userId, notificationId, type, title, message, relatedId = null) {
    // Get the global socket.io instance
    const io = global.io;
    if (!io) {
      console.warn("Socket.IO not available, skipping real-time notification");
      return;
    }
    
    // Get the user's socket ID from the global users object
    const users = global.users || {};
    const socketId = users[userId];
    
    if (socketId) {
      // Emit the notification to the specific user
      io.to(socketId).emit('new_notification', {
        id: notificationId,
        type,
        title,
        message,
        relatedId,
        createdAt: new Date()
      });
      
      console.log(`Real-time notification sent to user ${userId} via socket ${socketId}`);
    } else {
      console.log(`User ${userId} is not connected, notification saved to database only`);
    }
  }
  
  /**
   * Mark a notification as read
   * @param {number} notificationId - The ID of the notification to mark as read
   * @returns {Promise<boolean>} - Success status
   */
  async markAsRead(notificationId) {
    try {
      await database_pool.query(
        'UPDATE notifications SET Is_Read = TRUE WHERE Id = ?',
        [notificationId]
      );
      return true;
    } catch (err) {
      console.error("Error marking notification as read:", err);
      return false;
    }
  }
  
  /**
   * Mark all notifications for a user as read
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} - Success status
   */
  async markAllAsRead(userId) {
    try {
      await database_pool.query(
        'UPDATE notifications SET Is_Read = TRUE WHERE User_Id = ?',
        [userId]
      );
      return true;
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      return false;
    }
  }
  
  /**
   * Get all notifications for a user
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} - Array of notifications
   */
  async getNotifications(userId) {
    try {
      const [rows] = await database_pool.query(
        'SELECT * FROM notifications WHERE User_Id = ? ORDER BY Created_At DESC',
        [userId]
      );
      return rows;
    } catch (err) {
      console.error("Error getting notifications:", err);
      return [];
    }
  }
  
  /**
   * Get count of unread notifications for a user
   * @param {number} userId - The user ID
   * @returns {Promise<number>} - Count of unread notifications
   */
  async getUnreadCount(userId) {
    try {
      const [rows] = await database_pool.query(
        'SELECT COUNT(*) as count FROM notifications WHERE User_Id = ? AND Is_Read = FALSE',
        [userId]
      );
      return rows[0].count;
    } catch (err) {
      console.error("Error getting unread notification count:", err);
      return 0;
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;
