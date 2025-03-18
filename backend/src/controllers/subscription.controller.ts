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
 * Get current user's expiring subscription notifications
 */
export const getUserExpiringNotifications = async (
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

    // Get user's active subscription
    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: "active",
    }).populate("membershipId");

    if (!subscription) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    // Calculate days until expiration
    const endDate = new Date(subscription.endDate);
    const currentDate = new Date();
    const daysRemaining = Math.ceil(
      (endDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
    );
    console.log(daysRemaining);

    // Generate notifications based on days remaining
    const notifications = [];

    if (daysRemaining <= 70 && daysRemaining > 7) {
      notifications.push({
        id: `renewal-14-${subscription._id}`,
        type: "renewal",
        severity: "low",
        title: "Membership Expiring Soon",
        message: `Your ${
          (subscription.membershipId as any).name
        } membership will expire in ${daysRemaining} days.`,
        expiresIn: daysRemaining,
        subscriptionId: subscription._id,
      });
    } else if (daysRemaining <= 7 && daysRemaining > 3) {
      notifications.push({
        id: `renewal-7-${subscription._id}`,
        type: "renewal",
        severity: "medium",
        title: "Membership Expiring Soon",
        message: `Your ${
          (subscription.membershipId as any).name
        } membership will expire in ${daysRemaining} days.`,
        expiresIn: daysRemaining,
        subscriptionId: subscription._id,
      });
    } else if (daysRemaining <= 3 && daysRemaining > 0) {
      notifications.push({
        id: `renewal-3-${subscription._id}`,
        type: "renewal",
        severity: "high",
        title: "Membership Expiring Very Soon!",
        message: `Your ${
          (subscription.membershipId as any).name
        } membership will expire in ${daysRemaining} days.`,
        expiresIn: daysRemaining,
        subscriptionId: subscription._id,
      });
    }

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching user expiring notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
