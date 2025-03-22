import mongoose from "mongoose";
import dotenv from "dotenv";
import { AutoRenewalService } from "../services/autoRenewalService";
import Subscription from "../models/subscription.model";

// Load environment variables
dotenv.config();

async function runManualRenewal() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Connected to database");

    // Create test subscriptions that expire today
    const today = new Date();
    const testUserId = new mongoose.Types.ObjectId(); // Or use an existing user ID
    const testMembershipId = new mongoose.Types.ObjectId(
      "679b34787e7184a67ae4bbfc"
    ); // Use a valid membership ID

    // Create a subscription that will succeed (80% chance)
    await Subscription.create({
      userId: testUserId,
      membershipId: testMembershipId,
      startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: today, // Make it expire today
      duration: 1,
      totalAmount: 19.99,
      status: "active",
      autoRenew: true,
      paymentDetails: {
        cardNumber: "4111111111111111",
        expiryDate: "12/25",
      },
    });

    // Create a subscription that will fail (force failure)
    const subscriptionThatWillFail = await Subscription.create({
      userId: testUserId,
      membershipId: testMembershipId,
      startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: today, // Make it expire today
      duration: 1,
      totalAmount: 19.99,
      status: "active",
      autoRenew: true,
      paymentDetails: {
        cardNumber: "4111111111111111",
        expiryDate: "12/25",
      },
    });

    // Manually mark one as failed to ensure we have data to display
    await Subscription.findByIdAndUpdate(subscriptionThatWillFail._id, {
      renewalAttempted: true,
      lastRenewalAttempt: new Date(),
      renewalSuccessful: false,
      renewalFailureReason: "Test failure reason",
    });

    // Run the renewal service manually
    const renewalService = new AutoRenewalService();
    await renewalService.checkExpiringSubscriptions();

    console.log("Manual renewal completed");
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

runManualRenewal();
