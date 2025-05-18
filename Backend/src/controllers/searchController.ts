import { Request, Response } from 'express';
import { Post, User } from '../models';
import mongoose from 'mongoose';

// @desc    Search posts and users
// @route   GET /api/search
// @access  Public
export const search = async (req: Request, res: Response) => {
  try {
    const { query, type, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = String(query);
    const searchType = type ? String(type) : 'all';
    
    let results: any = { posts: [], users: [] };
    let total = 0;

    // Search posts if type is 'all' or 'posts'
    if (searchType === 'all' || searchType === 'posts') {
      // Search in post title, content, and tags
      const postResults = await Post.find({
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { 'blocks.content': { $regex: searchQuery, $options: 'i' } },
          { tags: { $regex: searchQuery, $options: 'i' } }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(searchType === 'posts' ? skip : 0)
      .limit(searchType === 'posts' ? Number(limit) : 5)
      .populate({
        path: 'author',
        select: 'name username avatar',
      });

      const postCount = await Post.countDocuments({
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { 'blocks.content': { $regex: searchQuery, $options: 'i' } },
          { tags: { $regex: searchQuery, $options: 'i' } }
        ]
      });

      results.posts = postResults;
      
      if (searchType === 'posts') {
        total = postCount;
      }
    }

    // Search users if type is 'all' or 'users'
    if (searchType === 'all' || searchType === 'users') {
      // Search in user name, username, and bio
      const userResults = await User.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { username: { $regex: searchQuery, $options: 'i' } },
          { bio: { $regex: searchQuery, $options: 'i' } }
        ]
      })
      .select('name username avatar bio')
      .sort({ createdAt: -1 })
      .skip(searchType === 'users' ? skip : 0)
      .limit(searchType === 'users' ? Number(limit) : 5);

      const userCount = await User.countDocuments({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { username: { $regex: searchQuery, $options: 'i' } },
          { bio: { $regex: searchQuery, $options: 'i' } }
        ]
      });

      results.users = userResults;
      
      if (searchType === 'users') {
        total = userCount;
      }
    }

    // Calculate total for combined search
    if (searchType === 'all') {
      total = results.posts.length + results.users.length;
    }

    res.status(200).json({
      results,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Search posts
// @route   GET /api/search/posts
// @access  Public
export const searchPosts = async (req: Request, res: Response) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = String(query);
    
    // Search in post title, content, and tags
    const posts = await Post.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { 'blocks.content': { $regex: searchQuery, $options: 'i' } },
        { tags: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate({
      path: 'author',
      select: 'name username avatar',
    });

    const total = await Post.countDocuments({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { 'blocks.content': { $regex: searchQuery, $options: 'i' } },
        { tags: { $regex: searchQuery, $options: 'i' } }
      ]
    });

    res.status(200).json({
      posts,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Search users
// @route   GET /api/search/users
// @access  Public
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = String(query);
    
    // Search in user name, username, and bio
    const users = await User.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } },
        { bio: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .select('name username avatar bio')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

    const total = await User.countDocuments({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } },
        { bio: { $regex: searchQuery, $options: 'i' } }
      ]
    });

    res.status(200).json({
      users,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
