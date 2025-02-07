import Booking from "../models/booking.model";

const isSlotAvailable = async (
  machineID: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> => {
  const overlappingBooking = await Booking.findOne({
    "machines.machineID": machineID, // Check if the machine is booked
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping condition
    ],
    isBooked: true, // Only check confirmed bookings
    status: { $in: ["Booked", "InUse"] }, // Exclude completed or cancelled bookings
  });

  return !overlappingBooking; // If no overlapping booking is found, return true (available)
};

export default isSlotAvailable;
