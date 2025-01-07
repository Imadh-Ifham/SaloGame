import mongoose, { Document, Model, Schema } from 'mongoose';


// Define the interface
interface IBooking extends Document {
  date: Date;
  time: TimeRanges;
  name: string;
  phone: number;
  email: string;
}

// Define the schema with type annotations
const bookingSchema: Schema<IBooking> = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // TimeRanges can't directly map; use String or a custom type
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Ensures createdAt and updatedAt fields are added
  }
);

// Define the model with the interface
const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
