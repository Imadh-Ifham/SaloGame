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
}

// Create the Offer schema
const offerSchema: Schema<IOffer> = new mongoose.Schema<IOffer>(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, required: true },
    endDateTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date): boolean {
          return value > new Date();
        },
        message: "End date and time must be in the future.",
      },
    },
    usageLimit: { type: Number }, // Optional
    usageCount: { type: Number, default: 0 }, // Default to 0
    membershipType: {
      type: Schema.Types.ObjectId,
      ref: "MembershipType",
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
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
