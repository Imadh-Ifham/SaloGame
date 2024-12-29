import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
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

const OfferSchema: Schema = new Schema(
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
    endDate: { type: Date, required: true },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IOffer>("Offer", OfferSchema);
