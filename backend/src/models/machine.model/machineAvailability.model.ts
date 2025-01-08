import mongoose, { Document, Schema } from "mongoose";

interface IBookedSlot {
  _id: Schema.Types.ObjectId;
  startTime: string;
  endTime: string;
}

interface IMachineAvailability extends Document {
  machineID: Schema.Types.ObjectId;
  date: Date;
  bookedSlots: IBookedSlot[];
}

const BookedSlotSchema: Schema = new Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

const MachineAvailabilitySchema: Schema = new Schema({
  machineID: {
    type: Schema.Types.ObjectId,
    ref: "Machine",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  bookedSlots: [BookedSlotSchema],
});

export default mongoose.model<IMachineAvailability>(
  "MachineAvailability",
  MachineAvailabilitySchema
);
