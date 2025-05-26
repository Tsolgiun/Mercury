// Global test configuration
export const TEST_TIMEOUT = 60000; // 60 seconds
export const DB_OPERATION_TIMEOUT = 30000; // 30 seconds

// MongoDB connection options - compatible with Mongoose 8+
export const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 15000, // 15 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 30000, // 30 seconds
  maxPoolSize: 10,
  minPoolSize: 2,
  bufferCommands: false, // Disable command buffering
};
