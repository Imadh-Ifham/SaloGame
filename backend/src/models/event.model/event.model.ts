import mongoose, { Model, Schema, Document } from "mongoose";

interface RegisteredEmail {
  email: string;
  verified: boolean;
  token: string;
}

// Define the Event interface
interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  eventName: string;
  category: "team-battle" | "single-battle";
  startDateTime: Date;
  endDateTime: Date;
  description: string;
  numberOfTeams?: number;
  participationPerTeam?: number;
  image: string;
  totalSpots: number,
  availableSpots: number,
  registeredEmails: Array<{
    email: string;
    verified: boolean;
    token: string;
  }>;
  winner?: string; // For single-battle
  winnerTeamId?: mongoose.Types.ObjectId; // For team-battle
  placements: Array<{
    teamId: string;
    teamName: string;
    teamLogo: string;
    placement: number;
    awardedAt: Date;
  }>
}

// Create the Event schema
const eventSchema = new Schema<IEvent>({
  eventName: { type: String, required: true },
  category: {
    type: String,
    enum: ["team-battle", "single-battle"],
    required: true,
  },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  description: { 
    type: String, required: true 
  },
  numberOfTeams: {
    type: Number,
    required: function(this: IEvent) {
      return this.category === "team-battle";
    }
  },
  participationPerTeam: {
    type: Number,
    required: function(this: IEvent) {
      return this.category === "team-battle";
    }
  },
  totalSpots: {
    type: Number,
    required: function(this: IEvent) {
      return this.category === "single-battle";
    }
  },
  image: { type: String, required: true },
  registeredEmails: [{
    email: { type: String, required: true },
    verified: { type: Boolean, default: false },
    token: { type: String, required: true }
  }],
  placements: {
    type: [{
      teamId: { type: String, required: true },
      teamName: { type: String, required: true },
      teamLogo: { type: String },
      placement: { type: Number, required: true, enum: [1, 2, 3] },
      awardedAt: { type: Date, default: Date.now }
    }],
    default: []
  }
}, { timestamps: true });

// Create the Event model
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;