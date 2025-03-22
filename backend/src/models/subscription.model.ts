import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  duration: number;
  totalAmount: number;
  status: "active" | "expired" | "cancelled";
  autoRenew: { type: Boolean; default: false };
  paymentStatus: "pending" | "completed" | "failed";
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
        // In production, you'd encrypt this field
      },
      expiryDate: {
        type: String,
      },
      // No CVV for security reasons
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);
