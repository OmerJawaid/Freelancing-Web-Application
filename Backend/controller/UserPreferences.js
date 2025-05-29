/**
 * UserPreferences.js
 * Controller for managing user preferences, including notification settings
 */

import { database_pool } from '../config/dbconnection.js';

/**
 * Get user preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserPreferences = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        
        // Check if preferences exist
        const [preferences] = await database_pool.query(
            `SELECT * FROM user_preferences WHERE user_id = ?`,
            [userId]
        );
        
        // If no preferences exist, create default ones
        if (!preferences || preferences.length === 0) {
            await database_pool.query(
                `INSERT INTO user_preferences 
                (user_id, receive_in_app_notifications, receive_email_notifications) 
                VALUES (?, TRUE, FALSE)`,
                [userId]
            );
            
            return res.status(200).json({
                success: true,
                preferences: {
                    userId: parseInt(userId),
                    receive_in_app_notifications: true,
                    receive_email_notifications: false
                }
            });
        }
        
        return res.status(200).json({
            success: true,
            preferences: preferences[0]
        });
    } catch (err) {
        console.error("Error fetching user preferences:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching user preferences", 
            error: err.message 
        });
    }
};

/**
 * Update notification preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateNotificationPreferences = async (req, res) => {
    try {
        const { userId } = req.params;
        const { receive_in_app_notifications, receive_email_notifications } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        
        // Ensure at least one notification method is enabled
        if (receive_in_app_notifications === false && receive_email_notifications === false) {
            return res.status(400).json({ 
                success: false, 
                message: "At least one notification method must be enabled" 
            });
        }
        
        // Check if preferences exist
        const [existingPrefs] = await database_pool.query(
            `SELECT * FROM user_preferences WHERE user_id = ?`,
            [userId]
        );
        
        // If preferences don't exist, create them
        if (!existingPrefs || existingPrefs.length === 0) {
            await database_pool.query(
                `INSERT INTO user_preferences 
                (user_id, receive_in_app_notifications, receive_email_notifications) 
                VALUES (?, ?, ?)`,
                [userId, !!receive_in_app_notifications, !!receive_email_notifications]
            );
        } else {
            // Update existing preferences
            await database_pool.query(
                `UPDATE user_preferences 
                SET receive_in_app_notifications = ?, 
                    receive_email_notifications = ? 
                WHERE user_id = ?`,
                [!!receive_in_app_notifications, !!receive_email_notifications, userId]
            );
        }
        
        // Get updated preferences
        const [updatedPrefs] = await database_pool.query(
            `SELECT * FROM user_preferences WHERE user_id = ?`,
            [userId]
        );
        
        return res.status(200).json({
            success: true,
            message: "Notification preferences updated successfully",
            preferences: updatedPrefs[0]
        });
    } catch (err) {
        console.error("Error updating notification preferences:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Error updating notification preferences", 
            error: err.message 
        });
    }
};

export {
    getUserPreferences,
    updateNotificationPreferences
};
