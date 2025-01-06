// models/game.model.ts
import mongoose, { Document, Model, Schema } from "mongoose";

// Define the interface for the Game document
interface IGame extends Document {
  name: string; // The name of the game
  description: string; // A description of the game
  rating?: number; // Optional rating of the game
  image?: string; // Optional image URL for the game
  genres: string[]; // List of genres
}

// Define the schema for the Game model
const gameSchema: Schema<IGame> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // Ensure unique names and trim whitespace
    description: { type: String, required: true, trim: true }, // Trim whitespace from the description
    rating: { type: Number, min: 0, max: 5, default: 0 }, // Restrict rating to a 0-5 range with a default value
    image: { type: String, trim: true }, // Trim whitespace from the image URL
    genres: { type: [String], default: [] }, // Array of genres with a default value
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Create the Game model
const Game: Model<IGame> =
  mongoose.models.Game || mongoose.model<IGame>("Game", gameSchema);

export default Game;
