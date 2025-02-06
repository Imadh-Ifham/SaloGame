import mongoose, { Document, Schema, Model } from "mongoose";
import { IMachineType } from "./machineType.model"; // Import the interface for machine types

// Interface for the Machine document
export interface IMachine extends Document {
  machineType: Schema.Types.ObjectId | IMachineType;
  machineCategory: "Console" | "PC-L" | "PC-R";
  serialNumber: string;
  status: "online" | "offline";
}

const MachineSchema: Schema<IMachine> = new Schema(
  {
    machineType: {
      type: Schema.Types.ObjectId,
      ref: "MachineType",
      required: true,
    },
    machineCategory: {
      type: String,
      enum: ["Console", "PC-L", "PC-R"],
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
  },
  { timestamps: true }
);

const Machine: Model<IMachine> =
  mongoose.models.Machine || mongoose.model<IMachine>("Machine", MachineSchema);

export default Machine;
