import mongoose, { Model, Schema, Document } from "mongoose";

// Define the Offer interface
interface IOffer extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  startDate: Date;
  endDateTime: Date;
  usageLimit?: number;
  usageCount: number;
  membershipType: mongoose.Types.ObjectId;
  category: string;
}

// Create the Offer schema
const offerSchema = new Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["general", "time-based", "membership-based", "exclusive"],
    },
    startDate: {
      type: Date,
      required: function (this: IOffer) {
        return this.category === "time-based" || this.category === "exclusive";
      },
    },
    endDateTime: {
      type: Date,
      required: function (this: IOffer) {
        return this.category === "time-based" || this.category === "exclusive";
      },
    },
    membershipType: {
      type: Schema.Types.ObjectId,
      ref: "MembershipType",
      required: function (this: IOffer) {
        return (
          this.category === "membership-based" || this.category === "exclusive"
        );
      },
    },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, min: 0 },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Query middleware to deactivate expired offers automatically
offerSchema.pre(/^find/, async function (next) {
  const currentDate = new Date();

  // Deactivate expired offers
  await (this.model as Model<IOffer>).updateMany(
    { endDateTime: { $lt: currentDate }, isActive: true },
    { $set: { isActive: false } }
  );

  next();
});

// Create the Offer model
const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>("Offer", offerSchema);

export default Offer;
