/**
 * User Preferences Router
 * Handles endpoints for user preferences, including notification preferences
 */

import express from 'express';
import { getUserPreferences, updateNotificationPreferences } from '../controller/UserPreferences.js';

const router = express.Router();

// Get user preferences
router.get('/:userId', getUserPreferences);

// Update notification preferences
router.put('/:userId/notifications', updateNotificationPreferences);

export default router;
