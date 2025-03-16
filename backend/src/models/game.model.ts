import mongoose, { Document, Model, Schema } from "mongoose";

export interface IGame extends Document {
  name: string;
  description: string;
  rating?: number;
  image?: string;
  genres: string[];
}

const gameSchema: Schema<IGame> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    image: { type: String, trim: true },
    genres: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const Game: Model<IGame> =
  mongoose.models.Game || mongoose.model<IGame>("Game", gameSchema);

export default Game;
