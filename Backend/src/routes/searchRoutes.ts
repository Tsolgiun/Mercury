import express from 'express';
import {
  search,
  searchPosts,
  searchUsers
} from '../controllers/searchController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Search routes (with optional auth for personalized responses)
router.get('/', [optionalAuth, search] as any);
router.get('/posts', [optionalAuth, searchPosts] as any);
router.get('/users', [optionalAuth, searchUsers] as any);

export default router;
