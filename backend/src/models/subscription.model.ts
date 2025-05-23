import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  duration: number;
  totalAmount: number;
  status: "active" | "expired" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed";
  autoRenew: boolean;
  paymentDetails?: {
    cardNumber?: string;
    expiryDate?: string;
  };
  renewalAttempted?: boolean;
  renewalSuccessful?: boolean;
  renewedFromSubscription?: mongoose.Types.ObjectId;
  renewalCompleted?: boolean;
  renewalCompletedAt?: Date;
  manuallyRenewed?: boolean;
  manuallyRenewedBy?: mongoose.Types.ObjectId;
  lastRenewalAttempt?: Date;
  renewalFailureReason?: string;
}

const SubscriptionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: "MembershipType",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    autoRenew: {
      type: Boolean,
      default: false,
    },
    paymentDetails: {
      cardNumber: {
        type: String,
      },
      expiryDate: {
        type: String,
      },
      // No CVV for security reasons
    },
    renewalAttempted: {
      type: Boolean,
      default: false,
    },
    renewalSuccessful: {
      type: Boolean,
      default: false,
    },
    lastRenewalAttempt: {
      type: Date,
    },
    renewalFailureReason: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);
