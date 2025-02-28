import mongoose, { Model, Schema, Document } from "mongoose";

// Define the Event interface
interface IEvent extends Document {
  eventName: string;
  category: "team-battle" | "single-battle";
  startDateTime: Date;
  endDateTime: Date;
  participationType: string;
  numberOfTeams?: number;
  participationPerTeam?: number;
}

// Create the Event schema
const eventSchema = new Schema<IEvent>(
  {
    eventName: { type: String, required: true },
    category: {
      type: String,
      enum: ["team-battle", "single-battle"],
      required: true,
    },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    participationType: { type: String, required: true },
    numberOfTeams: {
      type: Number,
      required: function (this: IEvent) {
        return this.category === "team-battle";
      },
    },
    participationPerTeam: {
      type: Number,
      required: function (this: IEvent) {
        return this.category === "team-battle";
      },
    },
  },
  { timestamps: true }
);

// Create the Event model
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;