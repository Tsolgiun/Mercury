import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { TEST_TIMEOUT, MONGO_OPTIONS } from './testConfig';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Set the default Jest timeout to 60 seconds
jest.setTimeout(TEST_TIMEOUT);

// Add a dummy test to satisfy Jest requirement
describe('Test Setup', () => {
  it('should setup the test environment', () => {
    expect(true).toBe(true);
  });
});

// Create a test database connection
beforeAll(async () => {
  // If already connected, don't connect again
  if (mongoose.connection.readyState === 1) {
    console.log('Already connected to test database');
    return;
  }

  // Use MongoDB Atlas connection
  const testDbUri = 'mongodb+srv://tsolgiun:mbNqswICVXsV1YlQ@cluster0.rrf5l.mongodb.net/mercury_test';
  
  try {
    // Use Mongoose 8 connection with proper options
    await mongoose.connect(testDbUri, MONGO_OPTIONS);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    // Fail tests if we can't connect to the database
    throw error;
  }
});

// Close database connection after tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close(false); // false to avoid forceful reconnection
      console.log('Database connection closed');
    } catch (err) {
      console.error('Error closing database connection:', err);
    }
  } else {
    console.log('Database connection already closed');
  }
});

// Clear all collections before each test
beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});
