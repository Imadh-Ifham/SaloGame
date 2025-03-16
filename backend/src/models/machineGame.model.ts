import mongoose, { Document, Schema, Model } from "mongoose";
import { IMachine } from "./machine.model/machine.model";
import { IGame } from "./game.model";

interface IGameMachine extends Document {
  machine: Schema.Types.ObjectId | IMachine;
  game: Schema.Types.ObjectId | IGame;
}

const GameMachineSchema: Schema<IGameMachine> = new Schema(
  {
    machine: {
      type: Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
  },
  { timestamps: true }
);

const GameMachine: Model<IGameMachine> =
  mongoose.models.GameMachine ||
  mongoose.model<IGameMachine>("GameMachine", GameMachineSchema);

export default GameMachine;
