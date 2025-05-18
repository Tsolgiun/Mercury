import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notificationController';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

router.route('/').get(getNotifications);
router.route('/read-all').put(markAllNotificationsAsRead);
router.route('/unread-count').get(getUnreadCount);
router.route('/:id/read').put(markNotificationAsRead);
router.route('/:id').delete(deleteNotification);

export default router;
