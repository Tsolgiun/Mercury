import express from 'express';
import {
  getCurrentUser,
  getUserByUsername,
  getUserByFirebaseUid,
  getUserById,
  updateUserProfile,
  getUsers,
  createAdminUser,
  deleteUser,
} from '../controllers/userController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/username/:username', [getUserByUsername] as any);
router.get('/firebase/:uid', [getUserByFirebaseUid] as any);
router.get('/:id', [getUserById] as any);

// Protected routes (require authentication)
router.get('/me', [protect, getCurrentUser] as any);
router.get('/profile', [protect, getCurrentUser] as any); // Keep for backward compatibility
router.put('/profile', [protect, updateUserProfile] as any);

// Admin routes
router.get('/', [protect, adminOnly, getUsers] as any);
router.post('/admin', [protect, adminOnly, createAdminUser] as any);
router.delete('/:id', [protect, adminOnly, deleteUser] as any);

export default router;
