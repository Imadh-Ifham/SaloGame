import { CronJob } from "cron";
import Subscription from "../models/subscription.model";
import MembershipType from "../models/membershipType.model";
import User from "../models/user.model";
import mongoose from "mongoose";

export class AutoRenewalService {
  private renewalJob: CronJob;

  constructor() {
    // Run every day at midnight
    this.renewalJob = new CronJob(
      "0 0 * * *",
      this.checkExpiringSubscriptions.bind(this),
      null,
      true
    );
  }

  async checkExpiringSubscriptions() {
    try {
      console.log("Checking for expiring subscriptions...");

      // Find subscriptions expiring in the next 24 hours that have auto-renewal enabled
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const expiringSubscriptions = await Subscription.find({
        status: "active",
        autoRenew: true,
        endDate: {
          $gte: new Date(),
          $lte: tomorrow,
        },
        paymentDetails: { $exists: true },
      }).populate("membershipId");

      console.log(
        `Found ${expiringSubscriptions.length} subscriptions to renew`
      );

      // Process each subscription
      for (const subscription of expiringSubscriptions) {
        await this.processRenewal(subscription);
      }

      const now = new Date();
      const expiredSubscriptions = await Subscription.find({
        status: "active",
        endDate: { $lt: now },
        // Either no auto-renewal or auto-renewal failed
        $or: [
          { autoRenew: false },
          { autoRenew: true, paymentDetails: { $exists: false } },
        ],
      });

      console.log(
        `Found ${expiredSubscriptions.length} subscriptions to mark as expired`
      );

      for (const subscription of expiredSubscriptions) {
        subscription.status = "expired";
        await subscription.save();
        console.log(`Marked subscription ${subscription._id} as expired`);
      }
    } catch (error) {
      console.error("Error in auto renewal check:", error);
    }
  }

  private async processRenewal(subscription: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log(
        `Processing auto-renewal for subscription ${subscription._id}`
      );

      // Get the membership ID properly - ensure it's an ObjectId
      const membershipId =
        subscription.membershipId._id || subscription.membershipId;

      // Simulate payment process (80% success rate as in the frontend)
      const paymentSuccessful = Math.random() <= 0.8;

      if (!paymentSuccessful) {
        console.log(`Payment failed for subscription ${subscription._id}`);
        // Could implement notification system to alert user about failed payment
        return;
      }

      // Calculate new dates
      const startDate = new Date(subscription.endDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + subscription.duration);

      // Create new subscription record
      const newSubscription = new Subscription({
        userId: subscription.userId,
        membershipId: subscription.membershipId,
        startDate,
        endDate,
        duration: subscription.duration,
        totalAmount: subscription.totalAmount,
        status: "active",
        paymentStatus: "completed",
        autoRenew: subscription.autoRenew,
        paymentDetails: subscription.paymentDetails,
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
        subscription._id,
        { status: "expired" },
        { session }
      );

      await session.commitTransaction();
      console.log(`Successfully renewed subscription ${subscription._id}`);

      // Could implement a notification system to inform the user about successful renewal
    } catch (error) {
      await session.abortTransaction();
      console.error(`Error renewing subscription ${subscription._id}:`, error);
    } finally {
      session.endSession();
    }
  }

  start() {
    this.renewalJob.start();
    console.log("Auto renewal service started");
  }

  stop() {
    this.renewalJob.stop();
    console.log("Auto renewal service stopped");
  }
}
