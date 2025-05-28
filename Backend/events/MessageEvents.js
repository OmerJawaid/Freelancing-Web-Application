/**
 * Message-related events
 * Used for real-time messaging functionality
 */
import { EventEmitter } from './EventEmitter.js';

// Create a singleton instance for message events
export const messageEvents = new EventEmitter();

// Define standard event names as constants to avoid typos
export const MESSAGE_EVENTS = {
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  MESSAGE_DELIVERED: 'message_delivered',
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',
  MESSAGE_DELETED: 'message_deleted'
};
