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
        message: "Only users can create subscriptions",
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
      autoRenew: req.body.autoRenew,
      paymentDetails: req.body.paymentDetails,
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
        message: "Only users can view their subscriptions",
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

/**
 * Get Membership Statistics
 */
export const getMembershipStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Query the database for statistics
    const totalActiveMembers = await Subscription.countDocuments({
      status: "active",
    });
    const totalRevenue = await Subscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const autoRenewalUsers = await Subscription.countDocuments({
      status: "active",
      autoRenew: true,
    });

    const failedPayments = await Subscription.countDocuments({
      renewalAttempted: true,
      renewalSuccessful: false,
      status: "active", // Still active but failed to renew
      autoRenew: true,
    });

    // Return the stats
    res.status(200).json({
      totalActiveMembers,
      totalRevenue: totalRevenue[0]?.total || 0,
      autoRenewalUsers,
      failedPayments,
    });
  } catch (error) {
    console.error("Error fetching membership stats:", error);
    res.status(500).json({ message: "Failed to fetch membership stats" });
  }
};

/**
 * Get Subscription Growth
 */
export const getSubscriptionGrowth = async (req: Request, res: Response) => {
  try {
    const lastSixMonths = new Date();
    lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);

    const growthData = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: lastSixMonths },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const formattedData = growthData.map((data) => ({
      month: data._id,
      count: data.count,
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error fetching subscription growth data:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data" });
  }
};

/**
 * Get Recent Activities
 */
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const recentSubscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("membershipId userId");
    console.log("Recent subscriptions", recentSubscriptions);

    const soonExpiringMemberships = await Subscription.find({
      status: "active",
      endDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Expiring in 7 days
    })
      .sort({ endDate: 1 })
      .populate("membershipId userId");
    console.log("Soon Expiring Memberships:", soonExpiringMemberships);

    const autoRenewals = await Subscription.find({
      status: "active",
      autoRenew: true,
      endDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }, // Renewing in 24 hours
    })
      .sort({ endDate: 1 })
      .populate("membershipId userId");
    console.log("Auto Renewals:", autoRenewals);

    const activities = [
      ...recentSubscriptions.map((sub) => ({
        type: "new_subscription",
        user: sub.userId,
        membership: sub.membershipId,
        date: sub.startDate,
      })),
      ...soonExpiringMemberships.map((sub) => ({
        type: "expiring_membership",
        user: sub.userId,
        membership: sub.membershipId,
        date: sub.endDate,
      })),
      ...autoRenewals.map((sub) => ({
        type: "auto_renewal",
        user: sub.userId,
        membership: sub.membershipId,
        date: sub.endDate,
      })),
    ];

    console.log("Combined Activities Before Sorting:", activities);

    // Sort activities by date (most recent first)
    activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    console.log("Sorted Activities:", activities);

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch recent activities" });
  }
};

/**
 * Get failed auto-renewals
 */
export const getFailedRenewals = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const failedRenewals = await Subscription.find({
      status: "active",
      autoRenew: true,
      renewalAttempted: true,
      renewalSuccessful: false,
      // Typically subscriptions with past end dates
      endDate: { $lt: new Date() },
    })
      .populate("userId", "email name")
      .populate("membershipId", "name duration price")
      .sort({ lastRenewalAttempt: -1 });

    res.status(200).json({
      success: true,
      count: failedRenewals.length,
      data: failedRenewals,
    });
  } catch (error) {
    console.error("Error fetching failed renewals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch failed auto-renewals",
    });
  }
};

/**
 * Manually renew a subscription
 */
export const manuallyRenewSubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      res
        .status(400)
        .json({ success: false, message: "Subscription ID is required" });
      return;
    }

    // Find the subscription
    const subscription = await Subscription.findById(subscriptionId)
      .populate("membershipId")
      .populate("userId");

    if (!subscription) {
      res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
      return;
    }

    // Calculate new dates
    const startDate = new Date(); // Start from today for manual renewal
    const endDate = new Date(startDate);
    const duration = subscription.duration || 1;
    endDate.setMonth(endDate.getMonth() + duration);

    // Create new subscription record
    const newSubscription = new Subscription({
      userId: subscription.userId,
      membershipId: subscription.membershipId,
      startDate,
      endDate,
      duration,
      totalAmount: subscription.totalAmount,
      status: "active",
      paymentStatus: "completed",
      autoRenew: subscription.autoRenew,
      ...(subscription.paymentDetails
        ? { paymentDetails: subscription.paymentDetails }
        : {}),
      renewedFromSubscription: subscription._id,
      renewalCompleted: true,
      renewalCompletedAt: new Date(),
      manuallyRenewed: true, // Add this flag for tracking manual renewalsl
    });

    await newSubscription.save({ session });

    // Update user's active subscription
    await User.findByIdAndUpdate(
      subscription.userId,
      { subscription: newSubscription._id },
      { session }
    );

    // Mark old subscription as expired
    await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        status: "expired",
        renewalSuccessful: true,
        renewalCompletedAt: new Date(),
        manuallyRenewed: true,
      },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Subscription manually renewed successfully",
      newSubscriptionId: newSubscription._id,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error manually renewing subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to manually renew subscription",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    session.endSession();
  }
};
