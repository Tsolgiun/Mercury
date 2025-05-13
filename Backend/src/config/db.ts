import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI as string;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      console.log('Running in development mode without MongoDB connection');
      // Don't exit the process, allow the app to run without MongoDB
    } else {
      console.error('An unknown error occurred while connecting to MongoDB');
      console.log('Running in development mode without MongoDB connection');
    }
    // Don't exit the process
  }
};

export default connectDB;
