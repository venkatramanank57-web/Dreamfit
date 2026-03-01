// routes/notification.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getNotifications,      // ✅ Changed from getUserNotifications
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationById
} from '../controllers/notification.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ==================== NOTIFICATION ROUTES ====================

// Get unread count
router.get('/unread-count', getUnreadCount);

// Get user notifications (with pagination)
router.get('/', getNotifications);  // ✅ This matches the export

// Get notification by ID
router.get('/:id', getNotificationById);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;