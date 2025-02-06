import mongoose, { Document, Schema } from "mongoose";

interface IBookedSlot {
  _id: Schema.Types.ObjectId;
  startTime: string;
  endTime: string;
  reservedAt: Date;
  isBooked: boolean;
  status: "Booked" | "In-Use" | "Done"; // Add the status field to the interface
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
  reservedAt: {
    type: Date,
    default: Date.now,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["Booked", "In-Use", "Done"],
    default: "Booked",
  },
});

const MachineAvailabilitySchema: Schema = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

export const MachineAvailability = mongoose.model<IMachineAvailability>(
  "MachineAvailability",
  MachineAvailabilitySchema
);

export { IBookedSlot, IMachineAvailability }; // Named exports
