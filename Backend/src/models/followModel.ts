import mongoose, { Document, Schema } from 'mongoose';

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Follower ID is required'],
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Following ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only follow another user once
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// Index for faster queries
followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

export default mongoose.model<IFollow>('Follow', followSchema);
