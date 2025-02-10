import mongoose, { Document, Schema } from "mongoose";

// Interface for the user model
export interface IUser extends Document {
  email: string;
  role: "user" | "manager" | "owner";
  firebaseUid: string;
  defaultMembershipId?: mongoose.Types.ObjectId;
  subscription: mongoose.Types.ObjectId;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "manager", "owner"], default: "user" },
  firebaseUid: { type: String, unique: true },
  defaultMembershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MembershipType",
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
  },
});

export default mongoose.model<IUser>("User", userSchema);
