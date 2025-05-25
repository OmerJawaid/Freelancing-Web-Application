import express from 'express';

notificationRouter.get('/test', (req, res) => {
  res.status(200).json({ message: "Notification routes are working" });
});

import { 
    getUserNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    getUnreadNotificationCount
} from "../controller/Notification.js";

const notificationRouter = express.Router();

// Get all notifications for a user
notificationRouter.get('/user/:userId', getUserNotifications);

// Get unread notification count
notificationRouter.get('/unread/:userId', getUnreadNotificationCount);

// Mark a notification as read
notificationRouter.put('/read/:notificationId', markNotificationAsRead);

// Mark all notifications as read for a user
notificationRouter.put('/read-all/:userId', markAllNotificationsAsRead);

export { notificationRouter };