// Create a test script you can run to insert test data
import mongoose from "mongoose";
import Subscription from "../models/subscription.model";
import dotenv from "dotenv";

dotenv.config();

async function createTestFailedRenewal() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Connected to database");

    // Find an existing user and membership to use
    // Alternatively, you can hardcode IDs for testing

    // Create a past end date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5); // 5 days ago

    // Create a renewal attempt date
    const renewalAttemptDate = new Date();
    renewalAttemptDate.setDate(renewalAttemptDate.getDate() - 6); // 6 days ago

    // Create test failed renewal
    const testSubscription = await Subscription.create({
      userId: "67d7b6dd109df816a1e813a1", // Replace with an actual user ID
      membershipId: "679b34787e7184a67ae4bbfc", // Replace with an actual membership ID
      startDate: new Date(pastDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days before end date
      endDate: pastDate,
      duration: 1,
      totalAmount: 19.99,
      status: "active", // Still active despite being expired
      paymentStatus: "failed",
      autoRenew: true,
      paymentDetails: { cardNumber: "4111111111111111", expiryDate: "12/25" },
      renewalAttempted: true,
      renewalSuccessful: false,
      lastRenewalAttempt: renewalAttemptDate,
      renewalFailureReason: "Payment processing failed",
    });

    console.log("Test failed renewal created:", testSubscription._id);
  } catch (error) {
    console.error("Error creating test data:", error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestFailedRenewal();
