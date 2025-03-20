// testAutoRenewal.ts
import mongoose from "mongoose";
import { AutoRenewalService } from "./services/autoRenewalService";
import Subscription from "./models/subscription.model";
import "./models/membershipType.model";
import "./models/user.model";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testAutoRenewal() {
  try {
    // Connect to your actual database
    await mongoose.connect(process.env.MONGO_URI || "");

    console.log("Connected to database");

    // Create a test subscription that expires today
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testUserId = new mongoose.Types.ObjectId("67cde2b68dec32fe2cfceed2");
    const testMembershipId = new mongoose.Types.ObjectId(
      "679b34787e7184a67ae4bbfc"
    );

    const testSubscription = await Subscription.create({
      userId: testUserId,
      membershipId: testMembershipId,
      startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: tomorrow, // Expires tomorrow
      duration: 1,
      totalAmount: 19.99,
      status: "active",
      autoRenew: true,
      paymentDetails: {
        cardNumber: "4111111111111111",
        expiryDate: "12/25",
      },
    });

    console.log("Test subscription created:", testSubscription._id);

    // Force auto-renewal
    const renewalService = new AutoRenewalService();
    await renewalService.checkExpiringSubscriptions();

    // Check for new subscription
    const newSubscription = await Subscription.findOne({
      userId: testUserId,
      status: "active",
      _id: { $ne: testSubscription._id },
    }).sort({ createdAt: -1 });

    console.log("New subscription after renewal:", newSubscription);
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

testAutoRenewal();
