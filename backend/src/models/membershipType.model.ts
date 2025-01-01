import mongoose, { Schema, Document } from "mongoose";

interface IMembershipType extends Document {
  name: string;
  price: number;
  loyaltyPointsPerBooking: number;
  benefits: string[];
}

const MembershipTypeSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  loyaltyPointsPerBooking: { type: Number, default: 0 },
  benefits: { type: [String], default: [] },
});

export default mongoose.model<IMembershipType>(
  "MembershipType",
  MembershipTypeSchema
);
