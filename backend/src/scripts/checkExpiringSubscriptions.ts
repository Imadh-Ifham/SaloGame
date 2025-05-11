import mongoose from "mongoose";
import Subscription from "../models/subscription.model";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

// Load environment variables
dotenv.config();

describe("Subscription Expiration Tests", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Use Memory Server for tests
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test("Should mark expired subscriptions as expired", async () => {
    // Create test data - one expired active subscription and one valid active subscription
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10); // 10 days from now

    // Create test user and membership IDs
    const testUserId = new mongoose.Types.ObjectId();
    const testMembershipId = new mongoose.Types.ObjectId();

    // Create an expired subscription that's still marked as active
    const expiredSubscription = await Subscription.create({
      userId: testUserId,
      membershipId: testMembershipId,
      startDate: new Date(pastDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days before end date
      endDate: pastDate, // Already expired
      duration: 1,
      totalAmount: 19.99,
      status: "active", // Incorrectly marked as active
      paymentStatus: "completed",
      autoRenew: false,
    });

    // Create a valid active subscription
    const validSubscription = await Subscription.create({
      userId: testUserId,
      membershipId: testMembershipId,
      startDate: new Date(),
      endDate: futureDate, // Not expired
      duration: 1,
      totalAmount: 19.99,
      status: "active",
      paymentStatus: "completed",
      autoRenew: false,
    });

    // Log initial state
    console.log("Before update:");
    console.log(`Expired subscription status: ${expiredSubscription.status}`);
    console.log(`Valid subscription status: ${validSubscription.status}`);

    // Find all expired subscriptions
    const now = new Date();
    const expiredSubscriptions = await Subscription.find({
      status: "active",
      endDate: { $lt: now },
    });

    // Log findings
    console.log(
      `Found ${expiredSubscriptions.length} expired subscriptions to update`
    );

    // Update expired subscriptions
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
    }

    // Verify the updates
    const updatedExpiredSub = await Subscription.findById(
      expiredSubscription._id
    );
    const updatedValidSub = await Subscription.findById(validSubscription._id);

    console.log("After update:");
    console.log(`Expired subscription status: ${updatedExpiredSub?.status}`);
    console.log(`Valid subscription status: ${updatedValidSub?.status}`);

    // Assertions
    expect(updatedExpiredSub?.status).toBe("expired");
    expect(updatedValidSub?.status).toBe("active");

    // Clean up
    await Subscription.deleteMany({
      _id: { $in: [expiredSubscription._id, validSubscription._id] },
    });
  });
});
