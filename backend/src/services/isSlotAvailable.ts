import Booking from "../models/booking.model";

const isSlotAvailable = async (
  machineID: string,
  startTime: Date,
  endTime: Date,
  excludeBookingID?: string
): Promise<boolean> => {
  const overlappingBooking = await Booking.findOne({
    "machines.machineID": machineID, // Check if the machine is booked
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping condition
    ],
    isBooked: true, // Only check confirmed bookings
    status: { $in: ["Booked", "InUse"] },
    _id: { $ne: excludeBookingID }, // Exclude the booking being updated // Exclude completed or cancelled bookings
  });

  console.log("Overlapping Booking:", overlappingBooking);

  return !overlappingBooking; // If no overlapping booking is found, return true (available)
};

export default isSlotAvailable;
