import { Request, Response } from "express";
import Subscription from "../models/subscription.model";
import MembershipType from "../models/membershipType.model";
import User from "../models/user.model";
import { AuthRequest } from "../middleware/types";

// Helper function to create default subscription
export const createDefaultSubscription = async (userId: string) => {
  try {
    // Find Basic Warrior membership
    const basicMembership = await MembershipType.findOne({
      name: "Basic Warrior",
    });
    if (!basicMembership) {
      throw new Error("Basic Warrior membership type not found");
    }

    // Create default subscription
    const subscription = new Subscription({
      userId,
      membershipId: basicMembership._id,
      duration: -1, // -1 indicates unlimited/default
      totalAmount: 0,
      startDate: new Date(),
      endDate: new Date(8640000000000000), // Far future date
      status: "active",
      paymentStatus: "completed",
      isDefaultMembership: true,
    });

    await subscription.save();

    // Update user's default membership
    await User.findByIdAndUpdate(userId, {
      defaultMembershipId: basicMembership._id,
    });

    return subscription;
  } catch (error) {
    console.error("Error creating default subscription:", error);
    throw error;
  }
};

export const createSubscription = async (
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

    // Create new subscription
    const subscription = new Subscription({
      userId: req.user.id,
      membershipId,
      duration,
      totalAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "active",
      paymentStatus: "completed", // Since we're not using payment gateway
    });

    await subscription.save();

    // Update user's default membership
    await User.findByIdAndUpdate(req.user.id, {
      defaultMembershipId: membershipId,
    });

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: (error as Error).message,
    });
  }
};

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
