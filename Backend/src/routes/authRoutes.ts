import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', [register] as any);
router.post('/login', [login] as any);
router.post('/refresh', [refreshToken] as any);

// Protected routes
router.post('/logout', [protect, logout] as any);

export default router;
