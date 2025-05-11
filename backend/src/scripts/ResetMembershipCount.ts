import mongoose from "mongoose";
import dotenv from "dotenv";
import Subscription from "../models/subscription.model";
import MembershipType from "../models/membershipType.model";

// Load environment variables
dotenv.config();

async function reconcileMembershipCounts() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Connected to database");

    // Get actual counts of active subscriptions by membership type
    const membershipCounts = await Subscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$membershipId", count: { $sum: 1 } } },
    ]);

    console.log(
      `Found ${membershipCounts.length} membership types with active subscriptions`
    );

    // Update each membership plan with the accurate count
    let updatedCount = 0;
    for (const item of membershipCounts) {
      const result = await MembershipType.findByIdAndUpdate(
        item._id,
        { $set: { subscriberCount: item.count } },
        { new: true }
      );

      if (result) {
        console.log(
          `Updated ${result.name}: subscriberCount set to ${item.count}`
        );
        updatedCount++;
      }
    }

    // Find membership types with no active subscriptions and set count to 0
    const allMembershipIds = await MembershipType.find({}).distinct("_id");
    const activeMembershipIds = membershipCounts.map((item) =>
      item._id.toString()
    );
    const inactiveMembershipIds = allMembershipIds.filter(
      (id) =>
        !activeMembershipIds.includes(
          (id as mongoose.Types.ObjectId).toString()
        )
    );

    if (inactiveMembershipIds.length > 0) {
      const resetResult = await MembershipType.updateMany(
        { _id: { $in: inactiveMembershipIds } },
        { $set: { subscriberCount: 0 } }
      );

      console.log(
        `Reset subscriber counts to 0 for ${resetResult.modifiedCount} inactive membership plans`
      );
    }

    console.log(`Membership count reconciliation completed successfully`);
  } catch (error) {
    console.error("Error reconciling membership counts:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the function
reconcileMembershipCounts();
