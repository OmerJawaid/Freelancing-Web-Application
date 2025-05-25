import { database_pool } from '../config/dbconnection.js';

// Create a new notification
const createNotification = async (userId, type, title, message, relatedId = null) => {
    try {
        await database_pool.query(
            `INSERT INTO notifications (User_Id, Type, Title, Message, Related_Id) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, type, title, message, relatedId]
        );
        
        // If socket is available, emit notification to the user
        const io = global.io;
        if (io) {
            const users = global.users || {};
            const socketId = users[userId];
            if (socketId) {
                io.to(socketId).emit('new_notification', {
                    type,
                    title,
                    message,
                    relatedId
                });
            }
        }
    } catch (err) {
        console.error("Error creating notification:", err);
    }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const [notifications] = await database_pool.query(
            `SELECT * FROM notifications 
             WHERE User_Id = ? 
             ORDER BY Created_At DESC 
             LIMIT 50`,
            [userId]
        );
        
        return res.status(200).json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        return res.status(500).json({ message: "Error fetching notifications", error: err.message });
    }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        if (!notificationId) {
            return res.status(400).json({ message: "Notification ID is required" });
        }
        
        await database_pool.query(
            `UPDATE notifications SET Is_Read = TRUE WHERE Id = ?`,
            [notificationId]
        );
        
        return res.status(200).json({ message: "Notification marked as read" });
    } catch (err) {
        console.error("Error marking notification as read:", err);
        return res.status(500).json({ message: "Error marking notification as read", error: err.message });
    }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        await database_pool.query(
            `UPDATE notifications SET Is_Read = TRUE WHERE User_Id = ?`,
            [userId]
        );
        
        return res.status(200).json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        return res.status(500).json({ message: "Error marking all notifications as read", error: err.message });
    }
};

// Get unread notification count
const getUnreadNotificationCount = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const [result] = await database_pool.query(
            `SELECT COUNT(*) as count FROM notifications 
             WHERE User_Id = ? AND Is_Read = FALSE`,
            [userId]
        );
        
        return res.status(200).json({ count: result[0].count });
    } catch (err) {
        console.error("Error fetching unread notification count:", err);
        return res.status(500).json({ message: "Error fetching unread notification count", error: err.message });
    }
};

export { 
    createNotification, 
    getUserNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    getUnreadNotificationCount
};