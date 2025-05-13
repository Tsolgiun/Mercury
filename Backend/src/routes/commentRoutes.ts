import express from 'express';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getCommentReplies,
} from '../controllers/commentController';
import { protect, optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Post-specific comment routes
router.post('/posts/:postId/comments', protect, createComment);
router.get('/posts/:postId/comments', optionalAuth, getCommentsByPost);

// Comment-specific routes
router.get('/comments/:id/replies', optionalAuth, getCommentReplies);
router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);
router.post('/comments/:id/like', protect, toggleCommentLike);

export default router;
