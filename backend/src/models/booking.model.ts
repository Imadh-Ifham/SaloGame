import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for machine booking details
export interface IMachineBooking {
  machineID: String;
  userCount: number | null;
}

// Main booking interface
export interface IBooking extends Document {
  userID?: Schema.Types.ObjectId; // Optional user ID reference
  customerName: string;
  phoneNumber: string;
  notes?: string;
  startTime: Date;
  endTime: Date;
  machines: IMachineBooking[];
  totalPrice?: number;
  transactionID?: Schema.Types.ObjectId;
  reservedAt?: Date;
  isBooked?: boolean;
  status: "Booked" | "InUse" | "Completed" | "Cancelled";
}

// Schema for booked time slots
const userPerMachine: Schema<IMachineBooking> = new Schema({
  machineID: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Machine",
  },
  userCount: {
    type: Number,
    default: 1,
  },
});

// Main booking schema
const bookingSchema: Schema<IBooking> = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    machines: [userPerMachine],
    totalPrice: {
      type: Number,
    },
    transactionID: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
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
      default: "Booked",
    },
  },
  {
    timestamps: true,
  }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
