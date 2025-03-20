import Booking from "../models/booking.model";

export const getBookingStatus = async (
  inputStartTime: Date,
  duration: number,
  machineID: string
) => {
  const InputStartTime = new Date(inputStartTime); // Convert inputStartTime to Date object
  const InputEndTime = new Date(
    InputStartTime.getTime() + duration * 60 * 1000
  ); // Convert duration from minutes to milliseconds

  // Find the booking where the machineID matches and time overlaps
  const booking = await Booking.findOne({
    machines: {
      $elemMatch: { machineID }, // Check for matching machineID in the array
    },
    status: { $in: ["Booked", "InUse"] }, // Add status condition
    $or: [
      { startTime: { $lt: InputEndTime }, endTime: { $gt: inputStartTime } }, // Any overlap
    ],
  })
    .sort({ startTime: 1, endTime: 1 }) // Sort by startTime and then endTime
    .select("status") // Select all fields you need
    .lean();

  return booking ? booking.status : "Available";
};
