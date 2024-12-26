import mongoose, { Model, Schema } from "mongoose";

interface IGame extends Document {
  _id: mongoose.Types.ObjectId;
  name: String;
  description: String;
  rating?: Number;
  image?: String;
}

const gameSchema: Schema<IGame> = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  rating: Number,
  image: String,
});

const Game: Model<IGame> =
  mongoose.models.Game || mongoose.model<IGame>("Game", gameSchema);

export default Game;
