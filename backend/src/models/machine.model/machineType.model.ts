import mongoose, { Schema, Document, Model } from "mongoose";

interface IMachineType extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  description: string;
  supportedGames: Schema.Types.ObjectId[];
  specifications: string;
  rate: number;
  imageUrl: string;
}

const MachineTypeSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  supportedGames: [{ type: Schema.Types.ObjectId, ref: "Game", default: [] }],
  specifications: { type: String },
  rate: { type: Number, required: true },
  imageUrl: { type: String },
});

const MachineType: Model<IMachineType> =
  mongoose.models.MachineType ||
  mongoose.model<IMachineType>("MachineType", MachineTypeSchema);

export default MachineType;
