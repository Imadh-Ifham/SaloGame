import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AutoRenewalService } from "../services/autoRenewalService";
import Subscription from "../models/subscription.model";
import User from "../models/user.model";

// Define ISubscription interface
interface ISubscription {
  userId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  duration: number;
  totalAmount: number;
  status: string;
  autoRenew: boolean;
  paymentDetails: {
    cardNumber: string;
    expiryDate: string;
  };
}

// Test IDs - keep these consistent
const testUserId = new mongoose.Types.ObjectId("6795182b79590198bbb6e880");
const testMembershipId = new mongoose.Types.ObjectId(
  "679b34787e7184a67ae4bbfc"
);

// Setting up MongoDB Memory Server
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log("Connected to in-memory MongoDB");
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log("Disconnected from in-memory MongoDB");
});

describe("Auto Renewal Service Tests", () => {
  test("Should auto-renew an expiring subscription", async () => {
    // Create a subscription that expires soon
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create test subscription
    const testSubscription = await Subscription.create({
      userId: testUserId,
      membershipId: testMembershipId,
      startDate: new Date(),
      endDate: tomorrow,
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

    // Modify the AutoRenewalService to force the payment to succeed
    const renewalService = new AutoRenewalService();

    // Force Math.random to return 0.5 (which is <= 0.8, so payment succeeds)
    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.5);

    // Run the check
    await renewalService.checkExpiringSubscriptions();

    // Restore Math.random
    Math.random = originalRandom;

    // Check if a new subscription was created
    const newSubscription = await Subscription.findOne({
      userId: testUserId,
      status: "active",
      _id: { $ne: testSubscription._id },
    }).sort({ createdAt: -1 });

    console.log("New subscription after renewal:", newSubscription);

    // Verify results
    expect(newSubscription).toBeTruthy();
    if (newSubscription) {
      expect(newSubscription.userId.toString()).toBe(testUserId.toString());
      expect(newSubscription.membershipId.toString()).toBe(
        testMembershipId.toString()
      );
      expect((newSubscription as unknown as ISubscription).autoRenew).toBe(
        true
      );
    }

    // Verify old subscription status
    const oldSubscription = await Subscription.findById(testSubscription._id);
    expect(oldSubscription?.status).toBe("expired");
  });
});
