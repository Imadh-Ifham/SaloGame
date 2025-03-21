import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { AutoRenewalService } from "../services/autoRenewalService";
import Subscription from "../models/subscription.model";

// Load environment variables
dotenv.config();

async function testExpirationCheck() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Connected to database");

    // Create a test subscription that has already expired
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Use a unique test user ID
    const testUserId = new mongoose.Types.ObjectId();
    const testMembershipId = new mongoose.Types.ObjectId(
      "679b34787e7184a67ae4bbfc"
    );

    // Create an expired subscription WITHOUT auto-renewal
    const expiredSubscription = await Subscription.create({
      userId: testUserId,
      membershipId: testMembershipId,
      startDate: twoMonthsAgo,
      endDate: yesterday, // Already expired
      duration: 2,
      totalAmount: 29.99,
      status: "active", // Still marked as active
      autoRenew: false,
    });

    console.log("Expired subscription created:", expiredSubscription._id);
    console.log("Initial status:", expiredSubscription.status);

    // Create an expired subscription WITH auto-renewal but NO payment details
    const expiredWithAutoRenew = await Subscription.create({
      userId: new mongoose.Types.ObjectId(),
      membershipId: testMembershipId,
      startDate: twoMonthsAgo,
      endDate: yesterday, // Already expired
      duration: 2,
      totalAmount: 29.99,
      status: "active", // Still marked as active
      autoRenew: true,
      // No payment details
    });

    console.log(
      "Expired subscription with auto-renewal created:",
      expiredWithAutoRenew._id
    );

    // Run the expiration check
    const renewalService = new AutoRenewalService();
    await renewalService.checkExpiringSubscriptions();

    // Check if subscriptions were marked as expired
    const updatedSubscription = await Subscription.findById(
      expiredSubscription._id
    );
    const updatedWithAutoRenew = await Subscription.findById(
      expiredWithAutoRenew._id
    );

    console.log("After expiration check:");
    console.log("Regular subscription status:", updatedSubscription?.status);
    console.log(
      "Auto-renewal subscription status:",
      updatedWithAutoRenew?.status
    );

    // Validate that they're both expired
    if (
      updatedSubscription?.status === "expired" &&
      updatedWithAutoRenew?.status === "expired"
    ) {
      console.log(
        "✅ TEST PASSED: Both subscriptions correctly marked as expired"
      );
    } else {
      console.log(
        "❌ TEST FAILED: Not all expired subscriptions were marked as expired"
      );
    }

    // Cleanup - delete test subscriptions
    await Subscription.deleteMany({
      _id: { $in: [expiredSubscription._id, expiredWithAutoRenew._id] },
    });
    console.log("Test subscriptions cleaned up");
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

testExpirationCheck();
