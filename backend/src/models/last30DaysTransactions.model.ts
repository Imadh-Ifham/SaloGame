import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILast30DaysTransaction extends Document {
  transactions: {
    transactionId: Schema.Types.ObjectId;
    userID: Schema.Types.ObjectId;
    paymentType: "cash" | "card" | "XP";
    amount: number;
    transactionType: "online-booking" | "walk-in-booking" | "membership";
    status: "pending" | "completed" | "failed";
    createdAt: Date;
  }[];
  totalEarnings: number;
  lastUpdated: Date;
}

const last30DaysTransactionsSchema = new Schema<ILast30DaysTransaction>({
  transactions: [{
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true
    },
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
      enum: ["online-booking", "walk-in-booking", "membership"],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      required: true
    }
  }],
  totalEarnings: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create a single document collection - we'll only ever have one document
last30DaysTransactionsSchema.statics.findOrCreate = async function() {
  const doc = await this.findOne();
  if (doc) {
    return doc;
  }
  return this.create({
    transactions: [],
    totalEarnings: 0,
    lastUpdated: new Date()
  });
};

const Last30DaysTransactions: Model<ILast30DaysTransaction> =
  mongoose.models.Last30DaysTransactions ||
  mongoose.model<ILast30DaysTransaction>("Last30DaysTransactions", last30DaysTransactionsSchema);

export default Last30DaysTransactions; 