import Booking, { IMachineBooking } from "../models/booking.model";

const findFirstAndNextBooking = async (
  inputStartTime: Date,
  duration: number,
  machineID: String
) => {
  const InputStartTime = new Date(inputStartTime); // Convert inputStartTime to Date object
  const InputEndTime = new Date(
    InputStartTime.getTime() + duration * 60 * 1000
  ); // Convert duration from minutes to milliseconds
  const CalculatedEndTime = new Date(
    InputStartTime.getTime() + 120 * 60 * 1000
  ); // 120 minutes after InputStartTime

  // Step 1: Find the first booking where the machineID matches and time overlaps
  const firstBookingData = await Booking.findOne({
    machines: {
      $elemMatch: {
        machineID: machineID, // Check for matching machineID in the array
      },
    },
    status: { $in: ["Booked", "InUse"] }, // Add status condition
    $or: [
      { startTime: { $lt: InputEndTime }, endTime: { $gt: inputStartTime } }, // Any overlap
    ],
  })
    .sort({ startTime: 1, endTime: 1 }) // Sort by startTime and then endTime
    .select("-isBooked -reservedAt -createdAt -updatedAt -__v")
    .populate({
      path: "transactionID",
      select: "-userID -__v -createdAt", // Exclude userID
    })
    .populate({
      path: "machines.machineID", // Populate machine details
      select: "machineCategory serialNumber", // Exclude unnecessary fields
    })
    .lean();

  let firstBooking = null;

  if (firstBookingData) {
    // Extract transaction details separately
    const { transactionID, ...bookingData } = firstBookingData; // Convert Mongoose document to plain object

    // Separate booking and transaction
    firstBooking = {
      booking: bookingData,
      transaction: transactionID || null, // Ensure transaction is explicitly null if not present
    };
  }

  let secondBookingData = null;
  let secondBooking = null;

  // Step 2: If no first booking, find second booking where startTime is between InputEndTime and CalculatedEndTime
  if (!firstBookingData) {
    secondBookingData = await Booking.findOne({
      machines: {
        $elemMatch: {
          machineID: machineID, // Check for matching machineID in the array
        },
      },
      status: { $in: ["Booked", "InUse"] }, // Add status condition
      startTime: {
        $gte: InputEndTime, // Start time should be after InputEndTime
        $lte: CalculatedEndTime, // Or it should be before CalculatedEndTime
      },
    })
      .select("-isBooked -reservedAt -createdAt -updatedAt -__v")
      .populate({
        path: "transactionID",
        select: "-userID -__v -createdAt", // Exclude userID
      })
      .populate({
        path: "machines.machineID", // Populate machine details
        select: "machineCategory serialNumber", // Exclude unnecessary fields
      })
      .lean();

    if (secondBookingData) {
      // Extract transaction details separately
      const { transactionID, ...bookingData } = secondBookingData; // Convert Mongoose document to plain object

      // Separate booking and transaction
      secondBooking = {
        booking: bookingData,
        transaction: transactionID || null, // Ensure transaction is explicitly null if not present
      };
    }
  } else {
    // Step 3: Find second booking based on the first booking's endTime and CalculatedEndTime
    secondBookingData = await Booking.findOne({
      machines: {
        $elemMatch: {
          machineID: machineID, // Check for matching machineID in the array
        },
      },
      startTime: {
        $gte: firstBookingData.endTime, // Start time of second booking must be after first booking's endTime
        $lte: CalculatedEndTime, // Or it should be within the CalculatedEndTime
      },
    })
      .select("-isBooked -reservedAt -createdAt -updatedAt -__v")
      .populate({
        path: "transactionID",
        select: "-userID -__v -createdAt", // Exclude userID
      })
      .populate({
        path: "machines.machineID", // Populate machine details
        select: "machineCategory serialNumber", // Exclude unnecessary fields
      })
      .lean();

    if (secondBookingData) {
      // Extract transaction details separately
      const { transactionID, ...bookingData } = secondBookingData; // Convert Mongoose document to plain object

      // Separate booking and transaction
      secondBooking = {
        booking: bookingData,
        transaction: transactionID || null, // Ensure transaction is explicitly null if not present
      };
    }
  }

  return { firstBooking, secondBooking };
};

export default findFirstAndNextBooking;
