import mongoose from 'mongoose';
import Post from '../../src/models/postModel';
import User from '../../src/models/userModel';
import { DB_OPERATION_TIMEOUT } from '../testConfig';

describe('Post Model Tests', () => {
  let userId: mongoose.Types.ObjectId;
  // Before running tests, create a test user to reference as author
  beforeAll(async () => {
    const user = new User({
      name: 'Post Author',
      email: 'author@example.com',
      username: 'postauthor',
      password: 'password123'
    });
      // In Mongoose 8+, timeout should be specified as an option
    const savedUser = await user.save({ timeout: DB_OPERATION_TIMEOUT });
    userId = savedUser._id;
  });

  // Test creating a short post
  it('should create & save a short post successfully', async () => {
    const shortPostData = {
      type: 'short',
      blocks: [
        {
          type: 'paragraph',
          content: 'This is a short post for testing'
        }
      ],
      author: userId,
      authorId: userId.toString(),
      tags: ['test', 'short']
    };

    const post = new Post(shortPostData);
    const savedPost = await post.save();
    
    // Verify saved post
    expect(savedPost._id).toBeDefined();
    expect(savedPost.type).toBe('short');
    expect(savedPost.blocks).toHaveLength(1);
    expect(savedPost.blocks[0].content).toBe('This is a short post for testing');
    expect(savedPost.author.toString()).toBe(userId.toString());
    expect(savedPost.likes).toBe(0);
    expect(savedPost.comments).toBe(0);
    expect(savedPost.createdAt).toBeDefined();
    expect(savedPost.updatedAt).toBeDefined();
  });

  // Test creating a long post
  it('should create & save a long post successfully', async () => {
    const longPostData = {
      type: 'long',
      title: 'Test Long Post',
      blocks: [
        {
          type: 'heading',
          content: 'Introduction',
          level: 2
        },
        {
          type: 'paragraph',
          content: 'This is a paragraph in a long post'
        },
        {
          type: 'code',
          content: 'console.log("Hello World")',
          language: 'javascript'
        }
      ],
      author: userId,
      authorId: userId.toString(),
      tags: ['test', 'long', 'article'],
      coverImage: 'https://example.com/image.jpg'
    };

    const post = new Post(longPostData);
    const savedPost = await post.save();
    
    // Verify saved post
    expect(savedPost._id).toBeDefined();
    expect(savedPost.type).toBe('long');
    expect(savedPost.title).toBe('Test Long Post');
    expect(savedPost.blocks).toHaveLength(3);
    expect(savedPost.blocks[0].type).toBe('heading');
    expect(savedPost.blocks[1].type).toBe('paragraph');
    expect(savedPost.blocks[2].type).toBe('code');
    expect(savedPost.coverImage).toBe('https://example.com/image.jpg');
    expect(savedPost.readingTime).toBeGreaterThan(0);
  });
  // Test validation: required fields
  it('should fail to create a post without required fields', async () => {
    // Missing type and blocks
    const invalidPost = new Post({
      author: userId,
      authorId: userId.toString()
    });

    let err: mongoose.Error.ValidationError;
    try {
      await invalidPost.save();
      fail('Expected validation error but got none');
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.type).toBeDefined();
    expect(err.errors.blocks).toBeDefined();
  });
  // Test validation: long post requires title
  it('should fail to create a long post without a title', async () => {
    const longPostWithoutTitle = new Post({
      type: 'long', // Long post
      blocks: [
        {
          type: 'paragraph',
          content: 'This is content but there is no title'
        }
      ],
      author: userId,
      authorId: userId.toString()
    });

    let err: mongoose.Error.ValidationError;
    try {
      await longPostWithoutTitle.save();
      fail('Expected validation error but got none');
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.title).toBeDefined();
  });

  // Test reading time calculation
  it('should calculate reading time based on content length', async () => {
    // Create a post with approx 400 words (should be 2 min reading time)
    const longContent = 'word '.repeat(400);
    
    const postWithLongContent = new Post({
      type: 'long',
      title: 'Long Reading Post',
      blocks: [
        {
          type: 'paragraph',
          content: longContent
        }
      ],
      author: userId,
      authorId: userId.toString()
    });

    const savedPost = await postWithLongContent.save();
    expect(savedPost.readingTime).toBe(2); // 400 words / 200 words per minute = 2 minutes
  });
});
