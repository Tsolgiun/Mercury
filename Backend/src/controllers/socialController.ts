import { Request, Response } from 'express';
import { User, Follow, Notification } from '../models';
import mongoose from 'mongoose';

// @desc    Follow a user
// @route   POST /api/social/follow/:userId
// @access  Private
export const followUser = async (req: Request, res: Response) => {
  try {
    const followingId = req.params.userId; // The user to follow
    const followerId = req.user?._id.toString(); // The current user

    // Check if users are the same
    if (followerId === followingId) {
      res.status(400).json({ message: 'You cannot follow yourself' });
      return;
    }

    // Check if the user to follow exists
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (existingFollow) {
      res.status(400).json({ message: 'Already following this user' });
      return;
    }

    // Create follow relationship
    await Follow.create({
      follower: req.user?._id,
      following: userToFollow._id,
    });

    // Create notification for the user being followed
    await Notification.create({
      recipient: userToFollow._id,
      sender: req.user?._id,
      type: 'follow',
      read: false,
    });

    res.status(200).json({ message: 'Successfully followed user' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/social/follow/:userId
// @access  Private
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const followingId = req.params.userId; // The user to unfollow
    const followerId = req.user?._id.toString(); // The current user

    // Check if the follow relationship exists
    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (!follow) {
      res.status(400).json({ message: 'Not following this user' });
      return;
    }

    // Delete the follow relationship
    await Follow.deleteOne({ _id: follow._id });

    res.status(200).json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get followers of a user
// @route   GET /api/social/followers/:userId
// @access  Public
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get followers
    const follows = await Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const followerIds = follows.map(follow => follow.follower.toString());

    // Get follower users
    const followers = await User.find({ _id: { $in: followerIds } }).select(
      'name username avatar bio'
    );

    // Check if the current user is following each follower
    let followingStatus: Record<string, boolean> = {};
    if (req.user) {
      const currentUserFollowing = await Follow.find({
        follower: req.user?._id,
        following: { $in: followerIds },
      });

      followingStatus = currentUserFollowing.reduce((acc: Record<string, boolean>, follow) => {
        acc[follow.following.toString()] = true;
        return acc;
      }, {});
    }

    // Add following status to each follower
    const followersWithStatus = followers.map(follower => ({
      ...follower.toObject(),
      isFollowing: followingStatus[follower._id.toString()] || false,
    }));

    const total = await Follow.countDocuments({ following: userId });

    res.status(200).json({
      followers: followersWithStatus,
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

// @desc    Get users followed by a user
// @route   GET /api/social/following/:userId
// @access  Public
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get following
    const follows = await Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const followingIds = follows.map(follow => follow.following.toString());

    // Get following users
    const following = await User.find({ _id: { $in: followingIds } }).select(
      'name username avatar bio'
    );

    // Check if the current user is following each user
    let followingStatus: Record<string, boolean> = {};
    if (req.user) {
      const currentUserFollowing = await Follow.find({
        follower: req.user?._id,
        following: { $in: followingIds },
      });

      followingStatus = currentUserFollowing.reduce((acc: Record<string, boolean>, follow) => {
        acc[follow.following.toString()] = true;
        return acc;
      }, {});
    }

    // Add following status to each user
    const followingWithStatus = following.map(followedUser => ({
      ...followedUser.toObject(),
      isFollowing: followingStatus[followedUser._id.toString()] || false,
    }));

    const total = await Follow.countDocuments({ follower: userId });

    res.status(200).json({
      following: followingWithStatus,
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

// @desc    Check if a user is following another user
// @route   GET /api/social/follow/check/:userId
// @access  Private
export const checkFollowStatus = async (req: Request, res: Response) => {
  try {
    const followingId = req.params.userId; // The user to check
    const followerId = req.user?._id.toString(); // The current user

    // Check if the follow relationship exists
    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    res.status(200).json({ isFollowing: !!follow });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get user stats (followers count, following count, posts count)
// @route   GET /api/social/stats/:userId
// @access  Public
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get counts
    const followersCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });
    const postsCount = await mongoose.model('Post').countDocuments({ author: userId });

    // Check if the current user is following this user
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({
        follower: req.user?._id,
        following: userId,
      });
      isFollowing = !!follow;
    }

    res.status(200).json({
      followersCount,
      followingCount,
      postsCount,
      isFollowing,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get suggested users to follow
// @route   GET /api/social/suggestions
// @access  Private
export const getSuggestedUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }
    
    const userId = req.user._id.toString();
    const limit = parseInt(req.query.limit as string) || 5;

    // Get users that the current user is following
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(follow => follow.following.toString());

    // Add the current user's ID to exclude from suggestions
    followingIds.push(userId);

    // Find users that the current user is not following
    const suggestedUsers = await User.find({ _id: { $nin: followingIds } })
      .sort({ createdAt: -1 }) // Newest users first
      .limit(limit)
      .select('name username avatar bio');

    res.status(200).json(suggestedUsers);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
