import mongoose, { Document, Schema } from "mongoose";

interface IMachineAvailability extends Document {
  _id: Schema.Types.ObjectId;
  machineID: Schema.Types.ObjectId;
  date: Date;
  bookedSlots: string[];
}

const MachineAvailabiltySchema: Schema = new Schema({
  machineID: {
    type: Schema.Types.ObjectId,
    ref: "Machine",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  bookedSlots: [
    {
      type: String,
      default: [],
    },
  ],
});

export default mongoose.model<IMachineAvailability>(
  "MachineAvailability",
  MachineAvailabiltySchema
);
