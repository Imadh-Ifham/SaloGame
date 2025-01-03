import mongoose, { Schema, Document } from "mongoose";

export interface ILayout extends Document {
  name: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId; // Admin who created the layout
  createdAt: Date;
  updatedAt: Date;
}

const LayoutSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

export const Layout = mongoose.model<ILayout>("Layout", LayoutSchema);
