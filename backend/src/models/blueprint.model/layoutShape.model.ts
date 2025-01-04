import mongoose, { Schema, Document } from "mongoose";

export interface IShape extends Document {
  name: string;
  type: "machine" | "wall" | "other";
  shapeData: any; // JSON structure for shape rendering
  preview?: string; // Optional URL for preview image
}

const ShapeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["machine", "wall", "other"], required: true },
    shapeData: { type: Schema.Types.Mixed, required: true },
    preview: { type: String },
  },
  { timestamps: true }
);

export const LayoutShape = mongoose.model<IShape>("LayoutShape", ShapeSchema);
