import mongoose, { Document, Schema } from 'mongoose';

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only bookmark a post once
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });
// Index for faster queries
bookmarkSchema.index({ user: 1 });

export default mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
