import mongoose, { Document, Schema, Model } from "mongoose";

// Interface for the MachineType document
export interface IMachineType extends Document {
  name: string;
  description: string;
  supportedGames: Schema.Types.ObjectId[];
  specifications: string;
  rate: number; // Hourly rate
  imageUrl: string;
}

const MachineTypeSchema: Schema<IMachineType> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  supportedGames: [{ type: Schema.Types.ObjectId, ref: "Game", default: [] }],
  specifications: { type: String },
  rate: { type: Number, required: true }, // Hourly rate is mandatory
  imageUrl: { type: String },
});

const MachineType: Model<IMachineType> =
  mongoose.models.MachineType ||
  mongoose.model<IMachineType>("MachineType", MachineTypeSchema);

export default MachineType;
