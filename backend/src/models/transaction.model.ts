import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITransaction extends Document {
  userID: Schema.Types.ObjectId;
  paymentType: "cash" | "card" | "XP";
  amount: number;
  transactionType: "online-booking" | "walk-in-booking" | "membership";
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  paymentType: {
    type: String,
    enum: ["cash", "card", "XP"],
    required: true
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["online-booking","walk-in-booking","membership"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);

export default Transaction;
