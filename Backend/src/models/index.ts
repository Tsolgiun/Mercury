import User, { IUser } from './userModel';
import Post, { IPost } from './postModel';
import Comment, { IComment } from './commentModel';
import Bookmark, { IBookmark } from './bookmarkModel';
import Follow, { IFollow } from './followModel';
import Like, { ILike } from './likeModel';
import Notification, { INotification } from './notificationModel';

// Export the model classes normally
export {
  User,
  Post,
  Comment,
  Bookmark,
  Follow,
  Like,
  Notification
};

// Export types with explicit 'export type'
export type {
  IUser,
  IPost,
  IComment,
  IBookmark,
  IFollow,
  ILike,
  INotification
};
