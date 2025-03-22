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

      // Check for failed renewals that have expired and mark them
      //await this.checkFailedRenewals();

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

      // Use bulk update for efficiency
      if (expiredSubscriptions.length > 0) {
        const updateResult = await Subscription.updateMany(
          {
            _id: { $in: expiredSubscriptions.map((sub) => sub._id) },
          },
          {
            $set: { status: "expired" },
          }
        );
        console.log(
          `Marked ${updateResult.modifiedCount} subscriptions as expired`
        );
      }
    } catch (error) {
      console.error("Error in auto renewal check:", error);
    }
  }

  // Check for failed renewals that have expired and mark them
  /*async checkFailedRenewals() {
    const now = new Date();
    // Find subscriptions that had renewal attempts, but failed and are now expired
    const failedRenewals = await Subscription.find({
      status: "active",
      endDate: { $lt: now },
      autoRenew: true,
      paymentDetails: { $exists: true },
      renewalAttempted: true,
      renewalSuccessful: false,
    });

    console.log(
      `Found ${failedRenewals.length} failed renewal subscriptions to mark as expired`
    );

    if (failedRenewals.length > 0) {
      const updateResult = await Subscription.updateMany(
        {
          _id: { $in: failedRenewals.map((sub) => sub._id) },
        },
        {
          $set: { status: "expired" },
        }
      );
      console.log(
        `Marked ${updateResult.modifiedCount} failed renewal subscriptions as expired`
      );
    }
  }*/

  private async processRenewal(subscription: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log(
        `Processing auto-renewal for subscription ${subscription._id}`
      );

      // Record Renewal attempt
      await Subscription.findByIdAndUpdate(subscription._id, {
        renewalAttempted: true,
        lastRenewalAttempt: new Date(),
      });

      // Get the membership ID properly - ensure it's an ObjectId
      const membershipId =
        subscription.membershipId._id || subscription.membershipId;

      // Simulate payment process (80% success rate as in the frontend)
      const paymentSuccessful = Math.random() <= 0.8;

      if (!paymentSuccessful) {
        console.log(`Payment failed for subscription ${subscription._id}`);

        // Record the failed renewal attempt
        await Subscription.findByIdAndUpdate(subscription._id, {
          renewalSuccessful: false,
          renewalFailureReason: "Payment processing failed",
        });

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
        renewedFromSubscription: subscription._id, // Track parent subscription
        renewalCompleted: true,
        renewalCompletedAt: new Date(),
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
        {
          status: "expired",
          renewalSuccessful: true,
          renewalCompletedAt: new Date(),
        },
        { session }
      );

      await session.commitTransaction();
      console.log(`Successfully renewed subscription ${subscription._id}`);

      // ***TASK ** -  implement a notification system to inform the user about successful renewal
    } catch (error) {
      await session.abortTransaction();
      console.error(`Error renewing subscription ${subscription._id}:`, error);

      // Record the error
      await Subscription.findByIdAndUpdate(subscription._id, {
        renewalSuccessful: false,
        renewalFailureReason: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
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
