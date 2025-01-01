import mongoose, { Schema, Document } from "mongoose";

export interface IElement extends Document {
  layoutId: mongoose.Types.ObjectId; // Associated layout
  shapeId: mongoose.Types.ObjectId; // Associated shape
  x: number;
  y: number;
  rotation?: number;
  zIndex?: number;
  isMachine: boolean;
  machineId?: mongoose.Types.ObjectId; // Reference to a machine (if applicable)
}

const ElementSchema: Schema = new Schema(
  {
    layoutId: { type: Schema.Types.ObjectId, ref: "Layout", required: true },
    shapeId: { type: Schema.Types.ObjectId, ref: "Shape", required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    rotation: { type: Number, default: 0 },
    zIndex: { type: Number, default: 0 },
    isMachine: { type: Boolean, default: false },
    machineId: { type: Schema.Types.ObjectId, ref: "Machine" },
  },
  { timestamps: true }
);

export const LayoutElement = mongoose.model<IElement>(
  "LayoutElement",
  ElementSchema
);
