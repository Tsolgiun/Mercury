import { Request, Response } from 'express';
import { Post, User, Comment, Like, Bookmark } from '../models';
import mongoose from 'mongoose';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req: Request, res: Response) => {
  try {
    const { type, title, blocks, tags, coverImage } = req.body;
    const user = req.user;

    // Validate user and required fields
    if (!user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!type || !blocks || !Array.isArray(blocks)) {
      res.status(400).json({ message: 'Type and blocks are required' });
      return;
    }

    // Validate post type
    if (type !== 'short' && type !== 'long') {
      res.status(400).json({ message: 'Post type must be either "short" or "long"' });
      return;
    }

    // For long posts, title is required
    if (type === 'long' && !title) {
      res.status(400).json({ message: 'Title is required for long posts' });
      return;
    }

    // Calculate reading time based on content length
    // Assuming average reading speed of 200 words per minute
    const wordCount = blocks.reduce((count: number, block: any) => {
      if (block.content) {
        return count + block.content.split(/\s+/).length;
      }
      return count;
    }, 0);
    const readingTime = Math.ceil(wordCount / 200);

    // Create post
    const post = await Post.create({
      type,
      title,
      blocks,
      author: user._id,
      authorId: user._id.toString(),
      tags: tags || [],
      coverImage,
      readingTime,
    });

    // Populate author information
    const populatedPost = await Post.findById(post._id).populate({
      path: 'author',
      select: 'name username avatar',
    });

    res.status(201).json(populatedPost);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get all posts with pagination
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name username avatar',
      });

    const total = await Post.countDocuments();

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(total / limit),
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

// @desc    Get posts for discovery feed
// @route   GET /api/posts/discover
// @access  Public
export const getDiscoverPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get a mix of short and long posts
    const posts = await Post.find({})
      .sort({ createdAt: -1, likes: -1 }) // Sort by newest and most liked
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name username avatar',
      });

    const total = await Post.countDocuments();

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(total / limit),
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

// @desc    Get posts from followed users
// @route   GET /api/posts/following
// @access  Private
export const getFollowingPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Get users that the current user follows
    const following = await mongoose.model('Follow').find({ follower: user._id }).select('following');
    const followingIds = following.map(follow => follow.following);

    // Get posts from followed users
    const posts = await Post.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name username avatar',
      });

    const total = await Post.countDocuments({ author: { $in: followingIds } });

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(total / limit),
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

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: 'author',
      select: 'name username avatar bio',
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Get comments for the post
    const comments = await Comment.find({ post: post._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'name username avatar',
      });

    // Check if the user has liked or bookmarked the post
    let isLiked = false;
    let isBookmarked = false;

    if (req.user) {
      const like = await Like.findOne({
        post: post._id,
        user: req.user._id,
      });

      const bookmark = await Bookmark.findOne({
        post: post._id,
        user: req.user._id,
      });

      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    res.status(200).json({
      post,
      comments,
      isLiked,
      isBookmarked,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { title, blocks, tags, coverImage } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Check if the user is authenticated and is the author of the post
    if (!req.user || !post.author.equals(req.user._id)) {
      res.status(403).json({ message: 'Not authorized to update this post' });
      return;
    }

    // Update post fields
    if (title !== undefined) post.title = title;
    if (blocks !== undefined) post.blocks = blocks;
    if (tags !== undefined) post.tags = tags;
    if (coverImage !== undefined) post.coverImage = coverImage;

    // Recalculate reading time if blocks were updated
    if (blocks !== undefined) {
      const wordCount = blocks.reduce((count: number, block: any) => {
        if (block.content) {
          return count + block.content.split(/\s+/).length;
        }
        return count;
      }, 0);
      post.readingTime = Math.ceil(wordCount / 200);
    }

    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Check if the user is authenticated and is the author of the post or an admin
    if (!req.user || (!post.author.equals(req.user._id) && !req.user.isAdmin)) {
      res.status(403).json({ message: 'Not authorized to delete this post' });
      return;
    }

    // Delete the post and related data
    await Promise.all([
      Post.deleteOne({ _id: post._id }),
      Comment.deleteMany({ post: post._id }),
      Like.deleteMany({ post: post._id }),
      Bookmark.deleteMany({ post: post._id }),
    ]);

    res.status(200).json({ message: 'Post removed' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Like or unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const userId = req.user._id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Check if user has already liked the post
    const existingLike = await Like.findOne({
      post: postId,
      user: userId,
    });

    if (existingLike) {
      // Unlike the post
      await Like.deleteOne({ _id: existingLike._id });
      
      // Decrement likes count
      post.likes -= 1;
      await post.save();

      res.status(200).json({ liked: false, likes: post.likes });
    } else {
      // Like the post
      await Like.create({
        post: postId,
        user: userId,
      });

      // Increment likes count
      post.likes += 1;
      await post.save();

      res.status(200).json({ liked: true, likes: post.likes });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Bookmark or unbookmark a post
// @route   POST /api/posts/:id/bookmark
// @access  Private
export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const userId = req.user._id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Check if user has already bookmarked the post
    const existingBookmark = await Bookmark.findOne({
      post: postId,
      user: userId,
    });

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.deleteOne({ _id: existingBookmark._id });
      res.status(200).json({ bookmarked: false });
    } else {
      // Add bookmark
      await Bookmark.create({
        post: postId,
        user: userId,
      });
      res.status(200).json({ bookmarked: true });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get bookmarked posts
// @route   GET /api/posts/bookmarks
// @access  Private
export const getBookmarkedPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const userId = req.user._id;

    // Get bookmarks for the user
    const bookmarks = await Bookmark.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const postIds = bookmarks.map(bookmark => bookmark.post);

    // Get the posts
    const posts = await Post.find({ _id: { $in: postIds } }).populate({
      path: 'author',
      select: 'name username avatar',
    });

    const total = await Bookmark.countDocuments({ user: userId });

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(total / limit),
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

// @desc    Get posts by tag
// @route   GET /api/posts/tags/:tag
// @access  Public
export const getPostsByTag = async (req: Request, res: Response) => {
  try {
    const tag = req.params.tag;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ tags: tag })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name username avatar',
      });

    const total = await Post.countDocuments({ tags: tag });

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(total / limit),
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

// @desc    Get posts by user
// @route   GET /api/posts/user/:userId
// @access  Public
export const getPostsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name username avatar',
      });

    const total = await Post.countDocuments({ author: user._id });

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
