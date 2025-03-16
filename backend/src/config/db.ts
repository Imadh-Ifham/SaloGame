import mongoose from "mongoose";
import { CleanupService } from "../services/cleanupService";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "");
    //CleanupService.initializeCleanupJob();
    console.log(`MongoDB Connected to Salo/SaloGame (AWS) - Clustor 0`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

export default connectDB;
