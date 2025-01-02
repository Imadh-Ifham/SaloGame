import mongoose, { Schema, Document } from "mongoose";

export interface IMembershipType extends Document {
  name: string;
  tagline?: string;
  price: number;
  xpRate: number; // a value that determines how much XP a user earns per LKR1000 spent
  priority: number;
  benefits: string[];
  isActive: boolean;
}

const MembershipTypeSchema: Schema = new Schema({
  name: { type: String, required: true },
  tagline: { type: String, default: "" },
  price: { type: Number, required: true },
  xpRate: { type: Number, default: 0 },
  priority: { type: Number, default: 3 },
  benefits: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
});

export default mongoose.model<IMembershipType>(
  "MembershipType",
  MembershipTypeSchema
);
