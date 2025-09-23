import mongoose from 'mongoose';
import { MongoDBUrl } from '../constants';


export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MongoDBUrl);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}