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
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
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
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date): boolean {
          // Check if the endDate is in the future
          return value > new Date();
        },
        message: "End date must be in the future.",
      },
    },
    usageLimit: { type: Number }, // Optional
    usageCount: { type: Number, default: 0 }, // Default to 0
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// Middleware to automatically deactivate offers if the current date has passed the endDate
offerSchema.pre("save", function (next) {
  if (this.endDate && new Date(this.endDate) < new Date()) {
    this.isActive = false; // Automatically set isActive to false
  }
  next();
});

// Create the Offer model
const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>("Offer", offerSchema);

export default Offer;
