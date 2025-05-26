import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from '../../src/routes/authRoutes';
import { User } from '../../src/models';
import { TEST_TIMEOUT } from '../testConfig';

// Create a test app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// Note: We don't need to create a MongoDB connection here
// as it's already handled in the global setup.ts file

describe('Auth Controller Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Check response structure
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      
      // Verify user was saved in the database
      const user = await User.findOne({ email: userData.email });
      expect(user).not.toBeNull();
      expect(user?.name).toBe(userData.name);
    });

    it('should return 400 for missing fields', async () => {
      const incompleteUserData = {
        name: 'Incomplete User',
        email: 'incomplete@example.com',
        // username is missing
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Please provide all required fields');
    });

    it('should return 400 for duplicate email', async () => {
      // First create a user
      const userData = {
        name: 'Original User',
        email: 'duplicate@example.com',
        username: 'originaluser',
        password: 'password123',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create another user with the same email
      const duplicateEmailUser = {
        name: 'Duplicate Email User',
        email: 'duplicate@example.com', // Same email
        username: 'differentuser',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateEmailUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      const userData = {
        name: 'Login Test User',
        email: 'login@example.com',
        username: 'loginuser',
        password: 'password123',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should return 401 for incorrect password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 404 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });
  });
});
