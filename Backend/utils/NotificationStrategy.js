/**
 * NotificationStrategy.js
 * 
 * Implements the Strategy Pattern for different notification delivery methods.
 * This allows for customizing notification delivery based on user preferences.
 */

import { database_pool } from '../config/dbconnection.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Base NotificationStrategy class that all concrete strategies will implement
 */
export class NotificationStrategy {
  /**
   * Send a notification using the strategy
   * @param {number} userId - The ID of the user to notify
   * @param {string} type - The type of notification (message, order, etc.)
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {number|null} relatedId - Optional related entity ID (e.g., conversation ID)
   * @returns {Promise<boolean>} - Success status
   */
  async sendNotification(userId, type, title, message, relatedId = null) {
    throw new Error('sendNotification method must be implemented by concrete strategies');
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
}

/**
 * In-app notification strategy - delivers notifications through the application UI
 */
export class InAppNotificationStrategy extends NotificationStrategy {
  async sendNotification(userId, type, title, message, relatedId = null) {
    try {
      // First save to database
      const notificationId = await this.saveToDatabase(userId, type, title, message, relatedId);
      
      // If socket is available, emit notification to the user
      const io = global.io;
      if (io) {
        const users = global.users || {};
        const socketId = users[userId];
        if (socketId) {
          io.to(socketId).emit('new_notification', {
            id: notificationId,
            type,
            title,
            message,
            relatedId,
            createdAt: new Date()
          });
        }
      }
      return true;
    } catch (err) {
      console.error("Error sending in-app notification:", err);
      return false;
    }
  }
}

/**
 * Email notification strategy - delivers notifications via email
 */
export class EmailNotificationStrategy extends NotificationStrategy {
  constructor() {
    super();
    
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  async sendNotification(userId, type, title, message, relatedId = null) {
    try {
      // Save to database first for record-keeping
      await this.saveToDatabase(userId, type, title, message, relatedId);
      
      // Get user's email from database
      const [userRows] = await database_pool.query(
        'SELECT Email FROM users WHERE Id = ?',
        [userId]
      );
      
      if (!userRows || userRows.length === 0) {
        console.error(`User with ID ${userId} not found for email notification`);
        return false;
      }
      
      const userEmail = userRows[0].Email;
      
      // Format email template based on notification type
      const emailSubject = this.getEmailSubject(type, title);
      const emailBody = this.getEmailBody(type, title, message, relatedId);
      
      // Send email
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: emailSubject,
        html: emailBody
      });
      
      return true;
    } catch (err) {
      console.error("Error sending email notification:", err);
      return false;
    }
  }
  
  /**
   * Generate email subject based on notification type
   */
  getEmailSubject(type, title) {
    return `Freelancing Platform: ${title}`;
  }
  
  /**
   * Generate email body based on notification type and content
   */
  getEmailBody(type, title, message, relatedId) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    let actionUrl = baseUrl;
    
    // Determine action URL based on notification type
    switch(type) {
      case 'message':
        actionUrl = `${baseUrl}/conversation/${relatedId}`;
        break;
      case 'order':
        actionUrl = `${baseUrl}/orders/${relatedId}`;
        break;
      case 'review':
        actionUrl = `${baseUrl}/reviews/${relatedId}`;
        break;
    }
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${title}</h2>
        <p style="color: #666; font-size: 16px;">${message}</p>
        <p style="margin-top: 20px;">
          <a href="${actionUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            View on Platform
          </a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This is an automated message from the Freelancing Platform. Please do not reply to this email.
        </p>
      </div>
    `;
  }
}

/**
 * Combined notification strategy - uses multiple strategies at once
 */
export class CombinedNotificationStrategy extends NotificationStrategy {
  constructor(strategies) {
    super();
    this.strategies = strategies || [];
  }
  
  async sendNotification(userId, type, title, message, relatedId = null) {
    const results = await Promise.all(
      this.strategies.map(strategy => 
        strategy.sendNotification(userId, type, title, message, relatedId)
      )
    );
    
    // Return true if at least one strategy succeeded
    return results.some(result => result === true);
  }
}

export default {
  NotificationStrategy,
  InAppNotificationStrategy,
  EmailNotificationStrategy,
  CombinedNotificationStrategy
};
