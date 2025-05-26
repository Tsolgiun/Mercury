import mongoose from 'mongoose';
import User from '../../src/models/userModel';
import { DB_OPERATION_TIMEOUT } from '../testConfig';

describe('User Model Tests', () => {
  // Test user creation with valid data
  it('should create & save a user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      isAdmin: false
    };    const user = new User(userData);
    const savedUser = await user.save({ timeout: DB_OPERATION_TIMEOUT });
    
    // Verify saved user
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.password).toBe(userData.password); // In a real app, this would be hashed
    expect(savedUser.isAdmin).toBe(false);
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });
  // Test validation: required fields
  it('should fail to create a user without required fields', async () => {
    const userWithoutRequiredField = new User({
      name: 'Incomplete User',
      email: 'incomplete@example.com',
      // username is missing
      password: 'password123'
    });

    let err: mongoose.Error.ValidationError;
    try {
      await userWithoutRequiredField.save();
      fail('Expected validation error but got none');
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.username).toBeDefined();
  });
  // Test validation: email format
  it('should fail for invalid email format', async () => {
    const userWithInvalidEmail = new User({
      name: 'Invalid Email User',
      email: 'invalid-email',
      username: 'invalidemail',
      password: 'password123'
    });

    let err: mongoose.Error.ValidationError;
    try {
      await userWithInvalidEmail.save();
      fail('Expected validation error but got none');
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });
    // Test unique constraints
  it('should fail for duplicate email', async () => {
    // First create a user
    const user1 = new User({
      name: 'Original User',
      email: 'duplicate@example.com',
      username: 'originaluser',
      password: 'password123'
    });
    await user1.save();
    
    // Try to create another user with the same email
    const user2 = new User({
      name: 'Duplicate Email User',
      email: 'duplicate@example.com', // Same email
      username: 'differentuser',
      password: 'password123'
    });
    
    let err: any;
    try {
      await user2.save();
      fail('Expected duplicate key error but got none');
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });
});
