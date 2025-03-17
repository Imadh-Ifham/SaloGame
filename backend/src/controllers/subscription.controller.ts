import { Request, Response } from "express";
import Subscription from "../models/subscription.model";
import MembershipType from "../models/membershipType.model";
import User from "../models/user.model";
import { AuthRequest } from "../middleware/types";
import mongoose from "mongoose";

/**
 * Create Subscription
 */
export const createSubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    // Check if user has role "user"
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "user") {
      res.status(403).json({
        success: false,
        message: "Only users can create subscriptions"
      });
      return;
    }

    const { membershipId, duration, totalAmount, startDate, endDate } =
      req.body;

    // Validate required fields
    if (!membershipId || !duration || !totalAmount) {
      res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
      return;
    }

    // Get user's current membership before update
    const currentUser = await User.findById(req.user.id).select(
      "defaultMembershipId"
    );
    const previousMembershipId = currentUser?.defaultMembershipId;

    // Validate dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
      return;
    }

    // Create new subscription
    const subscription = new Subscription({
      userId: req.user.id,
      membershipId,
      duration,
      totalAmount,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      status: "active",
      paymentStatus: "completed",
    });

    await subscription.save({ session });

    // Update user's subscription and default membership in a single operation
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          defaultMembershipId: membershipId,
          subscription: subscription._id,
        },
      },
      { session }
    );

    // Decrement previous membership's subscriber count if it exists
    if (previousMembershipId) {
      await MembershipType.findByIdAndUpdate(
        previousMembershipId,
        { $inc: { subscriberCount: -1 } },
        { session }
      );
    }

    // Increment the subscriber count for the membership type
    await MembershipType.findByIdAndUpdate(
      membershipId,
      { $inc: { subscriberCount: 1 } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get User Subscriptions
 */
export const getUserSubscriptions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    // Check if user has role "user"
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "user") {
      res.status(403).json({
        success: false,
        message: "Only users can view their subscriptions"
      });
      return;
    }

    const subscriptions = await Subscription.find({ userId: req.user.id })
      .populate("membershipId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: (error as Error).message,
    });
  }
};

/**
 * Assign MembershipType to a user
 */
export const assignMembership = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, membershipId } = req.body;

    if (!userId || !membershipId) {
      res.status(400).json({
        success: false,
        message: "Please provide both userId and membershipId",
      });
      return;
    }

    // Check if target user has role "user"
    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.role !== "user") {
      res.status(403).json({
        success: false,
        message: "Membership can only be assigned to users"
      });
      return;
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Default 1 month

    // Create new subscription
    const subscription = new Subscription({
      userId,
      membershipId,
      startDate,
      endDate,
      duration: 1,
      totalAmount: 0, // You might want to add price calculation logic
      status: "active",
      paymentStatus: "completed",
    });

    await subscription.save({ session });

    // Update user's membership
    await User.findByIdAndUpdate(
      userId,
      {
        defaultMembershipId: membershipId,
        subscription: subscription._id,
      },
      { session }
    );

    // Update membership subscriber count
    await MembershipType.findByIdAndUpdate(
      membershipId,
      { $inc: { subscriberCount: 1 } },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Membership assigned successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error assigning membership:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign membership",
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get memberships that are expiring soon (within 7 days by default)
 */
export const getExpiringSubscriptions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const daysThreshold = 7; // Configurable threshold
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const expiringSubscriptions = await Subscription.find({
      status: "active",
      endDate: {
        $gte: new Date(),
        $lte: thresholdDate,
      },
    }).populate([
      {
        path: "userId",
        select: "name email",
      },
      {
        path: "membershipId",
        select: "name",
      },
    ]);

    res.status(200).json({
      success: true,
      data: expiringSubscriptions,
    });
  } catch (error) {
    console.error("Error fetching expiring subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expiring subscriptions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Renew multiple subscriptions
 */
export const renewMultipleSubscriptions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { memberIds } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please provide an array of member IDs",
      });
      return;
    }

    const renewedSubscriptions = [];

    for (const userId of memberIds) {
      // Find current subscription
      const currentSubscription = await Subscription.findOne({
        userId,
        status: "active",
      }).session(session);

      if (!currentSubscription) continue;

      // Create new subscription dates
      const newStartDate = new Date();
      const newEndDate = new Date();
      newEndDate.setMonth(newEndDate.getMonth() + 1);

      // Update existing subscription
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        currentSubscription._id,
        {
          startDate: newStartDate,
          endDate: newEndDate,
          status: "active",
        },
        { new: true, session }
      );

      if (updatedSubscription) {
        renewedSubscriptions.push(updatedSubscription);
      }
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Successfully renewed ${renewedSubscriptions.length} subscriptions`,
      data: renewedSubscriptions,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error renewing subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to renew subscriptions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    session.endSession();
  }
};

//FOR RESETTING
/* Reset and recalculate subscriber counts
export const resetSubscriberCounts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. First reset all subscriber counts to 0
    await MembershipType.updateMany({}, { subscriberCount: 0 }, { session });

    // 2. Get all active subscriptions grouped by membershipId
    const subscriberCounts = await User.aggregate([
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscription",
          foreignField: "_id",
          as: "subscriptionData",
        },
      },
      {
        $unwind: "$subscriptionData",
      },
      {
        $match: {
          "subscriptionData.status": "active",
        },
      },
      {
        $group: {
          _id: "$subscriptionData.membershipId",
          count: { $sum: 1 },
        },
      },
    ]).session(session);

    // 3. Update each membership type with the correct count
    const updatePromises = subscriberCounts.map(({ _id, count }) =>
      MembershipType.findByIdAndUpdate(
        _id,
        { subscriberCount: count },
        { session }
      )
    );

    await Promise.all(updatePromises);
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Subscriber counts reset successfully",
      data: subscriberCounts,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error resetting subscriber counts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset subscriber counts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    session.endSession();
  }
};
*/
