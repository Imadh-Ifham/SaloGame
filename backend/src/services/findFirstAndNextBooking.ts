import mongoose from "mongoose";
import Booking, { IMachineBooking } from "../models/booking.model";

const findFirstAndNextBooking = async (
  inputStartTime: Date,
  duration: number,
  machineID: mongoose.Types.ObjectId
) => {
  const InputStartTime = new Date(inputStartTime); // Convert inputStartTime to Date object
  const InputEndTime = new Date(
    InputStartTime.getTime() + duration * 60 * 1000
  ); // Convert duration from minutes to milliseconds
  const CalculatedEndTime = new Date(
    InputStartTime.getTime() + 120 * 60 * 1000
  ); // 120 minutes after InputStartTime

  // Step 1: Find the first booking where the machineID matches and time overlaps
  const firstBooking = await Booking.findOne({
    machines: {
      $elemMatch: {
        machineID: machineID, // Check for matching machineID in the array
      },
    },
    $or: [
      { startTime: { $gte: inputStartTime, $lt: InputEndTime } },
      { endTime: { $gt: inputStartTime, $lte: InputEndTime } },
    ],
  })
    .sort({ startTime: 1, endTime: 1 }) // Sort by startTime and then endTime
    .select(
      "customerName phoneNumber notes startTime endTime machines status totalPrice"
    ) // Select all fields you need
    .lean();

  if (firstBooking) {
    // Explicitly filter the machines array
    firstBooking.machines = firstBooking.machines.filter(
      (machine: IMachineBooking) =>
        machine.machineID.toString() !== machineID.toString() // Compare using ObjectId equals
    );
  }

  let secondBooking = null;

  // Step 2: If no first booking, find second booking where startTime is between InputEndTime and CalculatedEndTime
  if (!firstBooking) {
    secondBooking = await Booking.findOne({
      machines: {
        $elemMatch: {
          machineID: machineID, // Check for matching machineID in the array
        },
      },
      startTime: {
        $gte: InputEndTime, // Start time should be after InputEndTime
        $lte: CalculatedEndTime, // Or it should be before CalculatedEndTime
      },
    })
      .select(
        "customerName phoneNumber notes startTime endTime machines status totalPrice"
      ) // Select all fields you need
      .lean();

    if (secondBooking) {
      // Explicitly filter the machines array
      secondBooking.machines = secondBooking.machines.filter(
        (machine: IMachineBooking) =>
          machine.machineID.toString() !== machineID.toString() // Compare machineID using .equals() for ObjectId
      );
    }
  } else {
    // Step 3: Find second booking based on the first booking's endTime and CalculatedEndTime
    secondBooking = await Booking.findOne({
      machines: {
        $elemMatch: {
          machineID: machineID, // Check for matching machineID in the array
        },
      },
      startTime: {
        $gte: firstBooking.endTime, // Start time of second booking must be after first booking's endTime
        $lte: CalculatedEndTime, // Or it should be within the CalculatedEndTime
      },
    })
      .select(
        "customerName phoneNumber notes startTime endTime machines status totalPrice"
      ) // Select all fields you need
      .lean();

    if (secondBooking) {
      // Explicitly filter the machines array
      secondBooking.machines = secondBooking.machines.filter(
        (machine: IMachineBooking) =>
          machine.machineID.toString() !== machineID.toString() // Compare machineID using .equals() for ObjectId
      );
    }
  }

  return { firstBooking, secondBooking };
};

export default findFirstAndNextBooking;
