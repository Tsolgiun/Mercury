import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only like a post or comment once
likeSchema.index({ user: 1, post: 1 }, { unique: true, sparse: true });
likeSchema.index({ user: 1, comment: 1 }, { unique: true, sparse: true });

// Validate that either post or comment is provided, but not both
likeSchema.pre('validate', function(next) {
  if ((this.post && this.comment) || (!this.post && !this.comment)) {
    next(new Error('A like must reference either a post or a comment, but not both'));
  } else {
    next();
  }
});

// Index for faster queries
likeSchema.index({ post: 1 });
likeSchema.index({ comment: 1 });

export default mongoose.model<ILike>('Like', likeSchema);
