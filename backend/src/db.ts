import mongoose from 'mongoose';
import process from 'process';

const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || typeof dbUrl !== 'string') {
    console.error('FATAL ERROR: DATABASE_URL is not defined in the .env file.');
    console.error('Please ensure you have a .env file in the /backend directory with a valid DATABASE_URL.');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(dbUrl);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      console.error('An unknown error occurred during DB connection');
    }
    process.exit(1);
  }
};

export default connectDB;