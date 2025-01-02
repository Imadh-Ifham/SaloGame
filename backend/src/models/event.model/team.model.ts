import mongoose, { Model, Schema, Document } from "mongoose";


interface IMember {
  userId: mongoose.Types.ObjectId; // Reference to the Users schema
  joinedAt: Date; // Timestamp of when the user joined
}

interface ITeam extends Document {
  _id: mongoose.Types.ObjectId;
  teamName: string;
  eventId: mongoose.Types.ObjectId; // Ref to the Event schema
  members: IMember[]; // team members array
  maxMembers: number; // Max members in the team
}

// Schema for a Team Member
const memberSchema: Schema<IMember> = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  joinedAt: { type: Date, default: Date.now },
});

// Schema for a Team
const teamSchema: Schema<ITeam> = new mongoose.Schema({
  teamName: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  members: { type: [memberSchema], default: [] },
  maxMembers: { type: Number, required: true },
});

// Model for a Team
const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", teamSchema);

export default Team;
