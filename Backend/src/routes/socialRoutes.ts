import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getUserStats,
  getSuggestedUsers,
} from '../controllers/socialController';
import { protect, optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (require authentication)
router.post('/follow/:userId', protect, followUser);
router.delete('/follow/:userId', protect, unfollowUser);
router.get('/follow/check/:userId', protect, checkFollowStatus);
router.get('/suggestions', protect, getSuggestedUsers);

// Public routes (with optional auth for personalized responses)
router.get('/followers/:userId', optionalAuth, getFollowers);
router.get('/following/:userId', optionalAuth, getFollowing);
router.get('/stats/:userId', optionalAuth, getUserStats);

export default router;
