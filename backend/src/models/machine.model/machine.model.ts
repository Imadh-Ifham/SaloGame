import mongoose, { Schema, Document } from "mongoose";

interface IMachine extends Document {
  _id: Schema.Types.ObjectId;
  machineType: Schema.Types.ObjectId;
  serialNumber: string;
  status: "available" | "in-use" | "under maintenance" | "offline";
}

const MachineSchema: Schema = new Schema(
  {
    machineType: {
      type: Schema.Types.ObjectId,
      ref: "MachineType",
      required: true,
    },
    serialNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["available", "in-use", "under maintenance", "offline"],
      default: "available",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMachine>("Machine", MachineSchema);
