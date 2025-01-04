import mongoose, { Schema, Document } from "mongoose";

interface IMachineType extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  description: string;
  supportedGames: string[];
  specifications: string;
  rate: number;
  imageUrl: string;
}

const MachineTypeSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  supportedGames: [{ type: String }],
  specifications: { type: String },
  rate: { type: Number, required: true },
  imageUrl: { type: String },
});

export default mongoose.model<IMachineType>("MachineType", MachineTypeSchema);
