import mongoose, { Schema, Document } from "mongoose";

interface TeamMember {
  email: string;
  verified: boolean;
  token: string;
}
interface ITeam extends Document {
  teamId: string;
  teamName: string;
  teamLogo: string;
  teamLeaderEmail: string;
  contactNumber: string;
  memberEmails: TeamMember[];
  eventRegistrations?: Array<{
    eventId: mongoose.Schema.Types.ObjectId;
    memberEmails: string[];
    registrationDate: Date;
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
    required: false,
    default: 'https://via.placeholder.com/150'
  },
  teamLeaderEmail: { 
    type: String, 
    required: true 
  },
  memberEmails: [{
    email: { type: String, required: true },
    verified: { type: Boolean, default: false },
    token: { type: String, required: true }
  }],
  eventRegistrations: [{
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    memberEmails: [String],
    registrationDate: { type: Date, default: Date.now }
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Add middleware to check if all members are verified
teamSchema.pre('save', function(next) {
  if (this.memberEmails.length > 0) {
    this.isVerified = this.memberEmails.every(member => member.verified);
  }
  next();
});

export default mongoose.model<ITeam>('Team', teamSchema);