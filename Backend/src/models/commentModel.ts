import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userId: string;
  content: string;
  parent?: mongoose.Types.ObjectId;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post ID is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userId: {
      type: String,
      required: [true, 'Firebase User ID is required'],
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parent: 1 });

export default mongoose.model<IComment>('Comment', commentSchema);
