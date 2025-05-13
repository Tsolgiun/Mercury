import express from 'express';
import {
  createPost,
  getPosts,
  getDiscoverPosts,
  getFollowingPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  getBookmarkedPosts,
  getPostsByTag,
  getPostsByUser,
} from '../controllers/postController';
import { protect, optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (require authentication)
router.post('/', protect, createPost);
router.get('/bookmarks', protect, getBookmarkedPosts);
router.get('/following', protect, getFollowingPosts);

// Public routes (with optional auth for personalized responses)
router.get('/', optionalAuth, getPosts);
router.get('/discover', optionalAuth, getDiscoverPosts);
router.get('/tags/:tag', optionalAuth, getPostsByTag);
router.get('/user/:userId', optionalAuth, getPostsByUser);

// Routes with ID parameter (must be last to avoid conflicts)
router.get('/:id', optionalAuth, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

export default router;
