import mongoose, { Document, Schema } from "mongoose";

// Interface for the user model
export interface IUser extends Document {
  email: string;
  role: "user" | "manager" | "owner";
  firebaseUid: string;
  defaultMembershipId?: mongoose.Types.ObjectId;
  xp: number;
  subscription?: mongoose.Types.ObjectId;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "manager", "owner"], default: "user" },
  firebaseUid: { type: String, unique: true },
  defaultMembershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MembershipType",
    // Only allow membership for users with role "user"
    validate: {
      validator: function(this: IUser) {
        return this.role === "user";
      },
      message: "Only users with role 'user' can have a membership"
    }
  },
  xp: { 
    type: Number, 
    default: 0,
    // Only allow XP for users with role "user"
    validate: {
      validator: function(this: IUser) {
        return this.role === "user" || this.xp === 0;
      },
      message: "Only users with role 'user' can have XP"
    }
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    // Only allow subscription for users with role "user"
    validate: {
      validator: function(this: IUser) {
        return this.role === "user";
      },
      message: "Only users with role 'user' can have a subscription"
    }
  },
});

// Pre-save middleware to ensure non-user roles don't have membership, subscription, or XP
userSchema.pre('save', function(next) {
  if (this.role !== 'user') {
    this.defaultMembershipId = null as any;
    this.subscription = null as any;
    this.xp = 0;
  }
  next();
});

export default mongoose.model<IUser>("User", userSchema);
