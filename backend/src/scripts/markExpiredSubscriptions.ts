import mongoose from "mongoose";
import dotenv from "dotenv";
import Subscription from "../models/subscription.model";

// Load environment variables
dotenv.config();

async function markExpiredSubscriptions() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Connected to database");

    // Get current date
    const now = new Date();

    // Find all active subscriptions with end date in the past
    const expiredSubscriptions = await Subscription.find({
      status: "active",
      endDate: { $lt: now },
    });

    console.log(
      `Found ${expiredSubscriptions.length} expired subscriptions to update`
    );

    // Update all found subscriptions to "expired" status
    if (expiredSubscriptions.length > 0) {
      const updateResult = await Subscription.updateMany(
        {
          status: "active",
          endDate: { $lt: now },
        },
        {
          $set: { status: "expired" },
        }
      );

      console.log(
        `Updated ${updateResult.modifiedCount} subscriptions to expired status`
      );
    } else {
      console.log("No expired subscriptions found");
    }
  } catch (error) {
    console.error("Error marking expired subscriptions:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the function
markExpiredSubscriptions();
