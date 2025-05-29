/**
 * NotificationFactory.js
 * 
 * Factory class for creating notification strategies based on user preferences.
 * Uses the Factory pattern to instantiate the appropriate strategy.
 */

import { database_pool } from '../config/dbconnection.js';
import { 
  InAppNotificationStrategy, 
  EmailNotificationStrategy,
  CombinedNotificationStrategy 
} from './NotificationStrategy.js';

export class NotificationFactory {
  /**
   * Get the appropriate notification strategy for a user based on their preferences
   * @param {number} userId - The user ID
   * @returns {Promise<NotificationStrategy>} - The appropriate notification strategy
   */
  static async getStrategyForUser(userId) {
    try {
      // Get user notification preferences from database
      const [preferences] = await database_pool.query(
        `SELECT 
          receive_in_app_notifications,
          receive_email_notifications
         FROM user_preferences 
         WHERE user_id = ?`,
        [userId]
      );
      
      // If no preferences found, create default preferences and use in-app only
      if (!preferences || preferences.length === 0) {
        await this.createDefaultPreferences(userId);
        return new InAppNotificationStrategy();
      }
      
      const pref = preferences[0];
      const strategies = [];
      
      // Add strategies based on user preferences
      if (pref.receive_in_app_notifications) {
        strategies.push(new InAppNotificationStrategy());
      }
      
      if (pref.receive_email_notifications) {
        strategies.push(new EmailNotificationStrategy());
      }
      
      // If no strategies enabled (unlikely), default to in-app
      if (strategies.length === 0) {
        return new InAppNotificationStrategy();
      }
      
      // If only one strategy, return it directly
      if (strategies.length === 1) {
        return strategies[0];
      }
      
      // Otherwise, return a combined strategy that uses all enabled methods
      return new CombinedNotificationStrategy(strategies);
    } catch (error) {
      console.error("Error determining notification strategy:", error);
      // Fall back to in-app notifications on error
      return new InAppNotificationStrategy();
    }
  }
  
  /**
   * Create default notification preferences for a new user
   * @param {number} userId - The user ID
   */
  static async createDefaultPreferences(userId) {
    try {
      await database_pool.query(
        `INSERT INTO user_preferences 
          (user_id, receive_in_app_notifications, receive_email_notifications) 
         VALUES (?, TRUE, FALSE)`,
        [userId]
      );
    } catch (error) {
      console.error("Error creating default notification preferences:", error);
    }
  }
}

export default NotificationFactory;
