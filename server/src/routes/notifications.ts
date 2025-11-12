import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Routes
router.get('/', authenticateJWT, getNotifications);
router.put('/:id/read', authenticateJWT, markAsRead);
router.put('/read-all', authenticateJWT, markAllAsRead);
router.delete('/:id', authenticateJWT, deleteNotification);

export default router;