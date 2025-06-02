import notificationService from '../utils/NotificationService.js';

// Create a new notification using the simplified notification service
const createNotification = async (userId, type, title, message, relatedId = null) => {
    try {
        // Send notification using the service
        await notificationService.sendNotification(userId, type, title, message, relatedId);
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
        
        const notifications = await notificationService.getNotifications(userId);
        
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
        
        const success = await notificationService.markAsRead(notificationId);
        
        if (success) {
            return res.status(200).json({ message: "Notification marked as read" });
        } else {
            return res.status(500).json({ message: "Failed to mark notification as read" });
        }
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
        
        const success = await notificationService.markAllAsRead(userId);
        
        if (success) {
            return res.status(200).json({ message: "All notifications marked as read" });
        } else {
            return res.status(500).json({ message: "Failed to mark all notifications as read" });
        }
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
        
        const count = await notificationService.getUnreadCount(userId);
        
        return res.status(200).json({ count });
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