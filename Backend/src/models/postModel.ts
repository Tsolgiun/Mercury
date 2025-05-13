import mongoose, { Document, Schema } from 'mongoose';

// Define the block interface for post content
interface IBlock {
  type: string;
  content?: string;
  url?: string;
  alt?: string;
  level?: number;
  language?: string;
}

export interface IPost extends Document {
  type: 'short' | 'long';
  title?: string;
  blocks: IBlock[];
  author: mongoose.Types.ObjectId;
  authorId: string; // Storing MongoDB ID as string for backward compatibility
  tags?: string[];
  parentId?: mongoose.Types.ObjectId;
  coverImage?: string;
  readingTime?: number;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    type: {
      type: String,
      enum: ['short', 'long'],
      required: [true, 'Post type is required'],
    },
    title: {
      type: String,
      required: function(this: IPost) {
        return this.type === 'long';
      },
    },
    blocks: {
      type: [{
        type: {
          type: String,
          required: true,
          enum: ['paragraph', 'heading', 'image', 'quote', 'code'],
        },
        content: String,
        url: String,
        alt: String,
        level: Number,
        language: String,
      }],
      required: [true, 'Post content is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    authorId: {
      type: String,
      required: [true, 'Author ID is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    coverImage: {
      type: String,
    },
    readingTime: {
      type: Number,
      default: function(this: IPost) {
        // Calculate reading time based on content length
        // Assuming average reading speed of 200 words per minute
        const wordCount = this.blocks.reduce((count, block) => {
          if (block.content) {
            return count + block.content.split(/\s+/).length;
          }
          return count;
        }, 0);
        return Math.ceil(wordCount / 200);
      },
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPost>('Post', postSchema);
