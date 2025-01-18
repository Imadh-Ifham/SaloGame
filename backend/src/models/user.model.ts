import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Interface for the user model
export interface IUser extends Document {
  email: string;
  password: string;
  role: "user" | "admin";
  firebaseUid: string;
  defaultMembershipId: mongoose.Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  firebaseUid: { type: String, unique: true },
  defaultMembershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MembershipType",
    required: true,
  },
});

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
