// server/src/routes/notification.routes.js
import express from 'express';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationById
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// Get notifications
router.get('/', getMyNotifications);
router.get('/unread/count', getUnreadCount);
router.get('/:id', getNotificationById);

// Mark as read
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

// Delete notifications
router.delete('/clear-all', clearAllNotifications);
router.delete('/:id', deleteNotification);

export default router;