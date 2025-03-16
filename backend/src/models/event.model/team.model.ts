import mongoose, { Model, Schema, Document } from "mongoose";

interface TeamMember {
  email: string;
  verified: boolean;
  token: string;
}
interface eventRegistrations {
  eventId: mongoose.Types.ObjectId;
  memberVerifications: TeamMember[];
}

interface ITeam extends Document {
  _id: mongoose.Types.ObjectId;
  teamId: string;
  teamName: string;
  teamLogo: string;
  teamLeaderId: mongoose.Types.ObjectId;
  contactNumber: string;
  eventRegistrations?: Array<{
    eventId: mongoose.Types.ObjectId;
    memberVerifications: Array<{
      email: string;
      verified: boolean;
      token: string;
    }>;
  }>;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>({
  teamId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => crypto.randomUUID().substring(0, 8)
  },
  teamName: { 
    type: String, 
    required: true,
    unique: true 
  },
  teamLogo: {
    type: String,
    required: true
  },
  teamLeaderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  contactNumber: { 
    type: String, 
    required: true 
  },
  eventRegistrations: [
    {
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
      },
      memberVerifications: [
        {
          email: { type: String, required: true },
          verified: { type: Boolean, default: false },
          token: { type: String, required: true },
        },
      ],
    },
  ],
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Team = mongoose.models.Team || mongoose.model<ITeam>("Team", teamSchema);
export default Team;