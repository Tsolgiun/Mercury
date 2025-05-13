import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

async function dropFirebaseIndex() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mercury';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Failed to get database instance');
    }
    const usersCollection = db.collection('users');

    try {
      // Drop the firebaseUid index
      await usersCollection.dropIndex('firebaseUid_1');
      console.log('Successfully dropped firebaseUid index');
    } catch (error: any) {
      console.log('Index firebaseUid_1 might not exist:', error.message);
    }

    // Update all documents to remove firebaseUid field
    const result = await usersCollection.updateMany(
      {},
      { $unset: { firebaseUid: "" } }
    );
    
    console.log(`Updated ${result.modifiedCount} documents - removed firebaseUid field`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the migration
dropFirebaseIndex();
