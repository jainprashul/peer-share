import mongoose from 'mongoose';
import { MongoDBUrl } from '../constants';
import { logger } from '../utils';


export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MongoDBUrl);
    logger.log("✅ MongoDB connected");

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}