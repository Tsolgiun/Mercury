import { Request, Response } from 'express';
import { Comment, Post } from '../models';
import mongoose from 'mongoose';

// @desc    Create a new comment
// @route   POST /api/posts/:postId/comments
// @access  Private
export const createComment = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    const parentId = req.body.parentId || null;
    const user = req.user;

    // Validate required fields
    if (!content) {
      res.status(400).json({ message: 'Comment content is required' });
      return;
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        res.status(404).json({ message: 'Parent comment not found' });
        return;
      }

      // Ensure parent comment belongs to the same post
      if (parentComment.post.toString() !== postId) {
        res.status(400).json({ message: 'Parent comment does not belong to this post' });
        return;
      }
    }

  // Create comment
  const comment = await Comment.create({
    post: postId,
    user: user?._id,
    userId: user?._id.toString(), // Use MongoDB _id instead of firebaseUid
    content,
    parent: parentId,
  });

    // Increment comment count on post
    post.comments += 1;
    await post.save();

    // Populate user information
    const populatedComment = await Comment.findById(comment._id).populate({
      path: 'user',
      select: 'name username avatar',
    });

    res.status(201).json(populatedComment);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Get top-level comments (no parent)
    const comments = await Comment.find({ post: postId, parent: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'user',
        select: 'name username avatar',
      });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parent: comment._id })
          .sort({ createdAt: 1 })
          .populate({
            path: 'user',
            select: 'name username avatar',
          });

        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    const total = await Comment.countDocuments({ post: postId, parent: null });

    res.status(200).json({
      comments: commentsWithReplies,
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

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

  // Check if the user is the author of the comment
  if (req.user && comment.userId !== req.user._id.toString()) {
    res.status(403).json({ message: 'Not authorized to update this comment' });
    return;
  }

    // Update comment
    comment.content = content;
    const updatedComment = await comment.save();

    // Populate user information
    const populatedComment = await Comment.findById(updatedComment._id).populate({
      path: 'user',
      select: 'name username avatar',
    });

    res.status(200).json(populatedComment);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

  // Check if the user is the author of the comment or an admin
  if (req.user && comment.userId !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403).json({ message: 'Not authorized to delete this comment' });
    return;
  }

    // Get post to update comment count
    const post = await Post.findById(comment.post);

    // Delete the comment and its replies
    const deletedComments = await Comment.deleteMany({
      $or: [{ _id: comment._id }, { parent: comment._id }],
    });

    // Update post comment count if post exists
    if (post) {
      post.comments -= deletedComments.deletedCount;
      if (post.comments < 0) post.comments = 0;
      await post.save();
    }

    res.status(200).json({ message: 'Comment removed' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Like or unlike a comment
// @route   POST /api/comments/:id/like
// @access  Private
export const toggleCommentLike = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
  const userId = req.user?._id.toString();

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    // Check if user has already liked the comment
    const existingLike = await mongoose.model('Like').findOne({
      comment: commentId,
      userId,
    });

    if (existingLike) {
      // Unlike the comment
      await mongoose.model('Like').deleteOne({ _id: existingLike._id });
      
      // Decrement likes count
      comment.likes -= 1;
      if (comment.likes < 0) comment.likes = 0;
      await comment.save();

      res.status(200).json({ liked: false, likes: comment.likes });
    } else {
      // Like the comment
      await mongoose.model('Like').create({
        comment: commentId,
      user: req.user?._id,
        userId,
      });

      // Increment likes count
      comment.likes += 1;
      await comment.save();

      res.status(200).json({ liked: true, likes: comment.likes });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get replies to a comment
// @route   GET /api/comments/:id/replies
// @access  Public
export const getCommentReplies = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if comment exists
    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    // Get replies
    const replies = await Comment.find({ parent: id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'user',
        select: 'name username avatar',
      });

    const total = await Comment.countDocuments({ parent: id });

    res.status(200).json({
      replies,
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
