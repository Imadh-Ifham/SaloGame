import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AutoRenewalService } from "../services/autoRenewalService";
import Subscription from "../models/subscription.model";
import "../models/membershipType.model";
import "../models/user.model";

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
  // Close any existing connection first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  // Create new memory server and connect
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log("Connected to in-memory MongoDB");

  // Clear any existing data
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
}, 10000); // Increase timeout for connection setup

afterAll(async () => {
  // Increase timeout for cleanup
  jest.setTimeout(10000);

  try {
    // Clean up database
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      console.log("Closed mongoose connection");
    }

    // Stop memory server
    if (mongoServer) {
      await mongoServer.stop();
      console.log("Stopped MongoDB memory server");
    }
  } catch (error) {
    console.error("Error during test cleanup:", error);
  }
}, 10000); // Increase timeout for cleanup

describe("Auto Renewal Service Tests", () => {
  // Clear collections before each test
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

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

    try {
      // Run the check
      await renewalService.checkExpiringSubscriptions();

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
    } finally {
      // Restore Math.random
      Math.random = originalRandom;
    }
  }, 10000); // Increase test timeout
});
