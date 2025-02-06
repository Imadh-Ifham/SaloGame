import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITransaction extends Document {
  userID?: Schema.Types.ObjectId;
  subscriptionID?: Schema.Types.ObjectId;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  status: "pending" | "completed" | "failed";
}

const transactionSchema = new Schema<ITransaction>({
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  subscriptionID: {
    type: Schema.Types.ObjectId,
    ref: "Subscription",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  netAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
});

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);

export default Transaction;
