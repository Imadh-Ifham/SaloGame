import { Request, Response } from "express";
import Machine from "../models/machine.model/machine.model";
import findFirstAndNextBooking from "../services/findFirstAndNextBooking";
import mongoose from "mongoose";
import { CustomerBooking } from "../types/booking";
import isSlotAvailable from "../services/isSlotAvailable";
import Booking from "../models/booking.model";
import calculateTotalPrice from "../services/calculatePrice";

export const getFirstAndNextBookingForAllMachines = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      inputStartTime,
      duration,
    }: { inputStartTime: Date; duration: number } = req.body;

    if (!inputStartTime || !duration) {
      res.status(400).json({
        error: "InputStartTime and duration are required fields.",
      });
      return;
    }

    // Step 1: Retrieve all machineIDs from the Machine schema
    const machines = await Machine.find().select("_id").lean(); // Assuming _id is the machineID field

    if (!machines || machines.length === 0) {
      res.status(404).json({ error: "No machines found." });
      return;
    }

    // Step 2: Initialize an empty object to store booking details for each machine
    const bookingDetails: Record<
      string,
      {
        firstBooking: CustomerBooking | null;
        status: string;
        nextBooking: CustomerBooking | null;
      }
    > = {};

    // Step 3: Loop through each machine and call findFirstAndNextBooking
    for (const machine of machines) {
      const machineID = machine._id as mongoose.Types.ObjectId; // Correctly typed ObjectId

      // Call the function we created to find first and next bookings
      const { firstBooking, secondBooking } = await findFirstAndNextBooking(
        inputStartTime,
        duration,
        machineID
      );

      // Get the status of the first booking (if it exists)
      let status = "Available"; // Default status
      if (firstBooking) {
        status = firstBooking.status; // Adjust logic as needed
      }

      // Step 4: Store the booking details for the machine
      bookingDetails[machineID.toString()] = {
        firstBooking: firstBooking ?? null, // Ensure it's null if undefined
        status: status,
        nextBooking: secondBooking ?? null, // Ensure it's null if undefined
      };
    }

    // Step 5: Return the structured result
    res.json({
      success: true,
      data: bookingDetails,
    });
    return;
  } catch (error) {
    console.error("Error fetching booking details:", error);

    // Return a structured error response
    res.status(500).json({
      success: false,
      error: "Error fetching booking details",
      message: (error as Error).message || "Something went wrong.",
    });
    return;
  }
};

export const createBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      machines,
      startTime,
      endTime,
      customerName,
      phoneNumber,
      notes,
      status = "InUse",
    } = req.body;

    const { mode } = req.query;

    // Validate required fields
    if (!machines || !Array.isArray(machines) || machines.length === 0) {
      res.status(400).json({ message: "At least one machine is required." });
      return;
    }

    if (!customerName || typeof customerName !== "string") {
      res.status(400).json({ message: "Invalid customer name." });
      return;
    }

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      res.status(400).json({
        message: "Invalid phone number. Must be 10 digits.",
      });
      return;
    }

    // Convert and Validate Dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ message: "Invalid date format." });
      return;
    }

    const currentTimeMinusFiveMinutes = new Date(
      new Date().getTime() - 5 * 60 * 1000
    );

    if (start < currentTimeMinusFiveMinutes) {
      res
        .status(400)
        .json({
          message: "Start time cannot be in the past by more than 5 minutes.",
        });
      return;
    }

    if (end <= start) {
      res.status(400).json({ message: "End time must be after start time." });
      return;
    }

    // Check for overlapping bookings (handle race conditions)
    for (const machine of machines) {
      const isAvailable = await isSlotAvailable(machine.machineID, start, end);
      if (!isAvailable) {
        res.status(400).json({
          message: `Machine ${machine.machineID} is already booked for the selected time slot.`,
        });
        return;
      }
    }

    // Calculate total price securely
    let totalPrice: number;
    try {
      totalPrice = await calculateTotalPrice(start, end, machines);
    } catch (error) {
      res.status(400).json({
        message: "Error calculating price",
        error: (error as Error).message,
      });
      return;
    }

    // Proceed to save booking (handle race conditions)
    const session = await Booking.startSession();
    session.startTransaction();

    try {
      const newBooking = new Booking({
        customerName,
        phoneNumber,
        notes,
        machines,
        totalPrice,
        startTime: start,
        endTime: end,
        isBooked: true,
        status,
      });

      await newBooking.save({ session });
      await session.commitTransaction();
      session.endSession();

      res
        .status(201)
        .json({ message: "Booking created successfully", booking: newBooking });
    } catch (dbError) {
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({
        message: "Error saving booking",
        error: (dbError as Error).message,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Unexpected server error",
      error: (error as Error).message,
    });
  }
};

/*
interface BookingSlot {
  startTime: string;
  endTime: string;
}

interface AvailabilitySlot extends BookingSlot {
  isBooked?: boolean;
  reservedAt?: Date;
}

interface ValidationResult {
  availability: any; // Replace with your MachineAvailability type
  machine: any; // Replace with your Machine type
  slotsToBook: Array<{
    slot: AvailabilitySlot;
    bookingSlot: BookingSlot;
  }>;
  machinePrice: number;
}

export const reserveBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      userID,
      customerName,
      phoneNumber,
      notes,
      startTime,
      endTime,
      machines,
    } = req.body;

    // Validate the input
    if (!Array.isArray(machines) || machines.length === 0) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ message: "machines must be a non-empty array" });
      return;
    }

    const validationResults: ValidationResult[] = [];
    let totalBookingPrice = 0;

    // Phase 1: Validate all machines without persisting changes
    for (const machineID of machines) {
      // Look up the machine availability
      const availability = await MachineAvailability.findOne({
        machineID,
        date,
      }).session(session); // Make sure to use the same session

      if (!availability) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({
          message: "Booking failed",
          error: `Availability not found for machine ${machineID}. No machines were booked.`,
        });
        return;
      }

      try {
        // Check if the requested slots are actually available
        const slotsToBook = bookedSlots.map((bookingSlot: BookingSlot) => {
          const matchingSlot = availability.bookedSlots.find(
            (slot: AvailabilitySlot) =>
              slot.startTime === bookingSlot.startTime &&
              slot.endTime === bookingSlot.endTime &&
              !slot.isBooked
          );

          if (!matchingSlot) {
            throw new Error(
              `Slot ${bookingSlot.startTime}-${bookingSlot.endTime} ` +
                `is not available for machine ${machineID}`
            );
          }

          return {
            slot: matchingSlot,
            bookingSlot,
          };
        });

        // Look up the machine to calculate price
        const machine = await Machine.findById(machineID)
          .populate("machineType")
          .session(session);

        if (!machine) {
          throw new Error(`Machine ${machineID} not found`);
        }

        const machineType = machine.machineType as IMachineType;
        const ratePerHour = machineType.rate;
        let machinePrice = 0;

        // Compute the cost for the requested slots
        for (const slot of bookedSlots) {
          const start = new Date(`1970-01-01T${slot.startTime}:00Z`).getTime();
          const end = new Date(`1970-01-01T${slot.endTime}:00Z`).getTime();
          const durationInHours = (end - start) / (1000 * 60 * 60);
          machinePrice += durationInHours * ratePerHour;
        }

        totalBookingPrice += machinePrice;

        validationResults.push({
          availability,
          machine,
          slotsToBook,
          machinePrice,
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({
          message: "Booking failed",
          error: `${(error as Error).message}. No machines were booked.`,
        });
        return;
      }
    }

    // Phase 2: Apply all changes now that validation passed
    // Mark slots as booked for each machine
    for (const result of validationResults) {
      const { availability, slotsToBook } = result;
      for (const { slot } of slotsToBook) {
        slot.isBooked = true;
      }
      await availability.save({ session });
    }

    // If userID is provided, find the user
    let user = null;
    if (userID) {
      user = await User.findById(userID).session(session);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: "User not found" });
        return;
      }
    }

    // Create a single Booking document for all machines
    const newBooking = new Booking({
      userID: user ? user._id : undefined,
      userName,
      phoneNumber,
      date,
      machines: validationResults.map((result) => ({
        machineID: result.machine._id,
        machineName: result.machine.serialNumber,
        bookedSlots: result.slotsToBook.map(({ bookingSlot }) => bookingSlot),
        price: result.machinePrice,
        machineType: result.machine.machineType,
      })),
      totalPrice: totalBookingPrice,
    });

    const savedBooking = await newBooking.save({ session });

    // Commit transaction if everything is successful
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(201).json({
      message: "All machines successfully booked",
      booking: savedBooking,
      summary: {
        totalMachines: machineIDs.length,
        totalPrice: totalBookingPrice,
      },
    });
  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      error: "Server error occurred. No machines were booked.",
      details: (error as Error).message,
    });
  }
};
export const calculatePrice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { machineIDs, bookedSlots } = req.body;

    if (!Array.isArray(machineIDs) || machineIDs.length === 0) {
      res.status(400).json({ message: "machineIDs must be a non-empty array" });
      return;
    }

    const results = [];
    const errors = [];

    for (const machineID of machineIDs) {
      try {
        const machine = await Machine.findById(machineID).populate(
          "machineType"
        );
        if (!machine) {
          errors.push({
            machineID,
            error: "Machine not found",
          });
          continue;
        }

        const machineType = machine.machineType as IMachineType;
        const ratePerHour = machineType.rate;
        let totalPrice = 0;

        for (const slot of bookedSlots) {
          const start = new Date(`1970-01-01T${slot.startTime}:00Z`).getTime();
          const end = new Date(`1970-01-01T${slot.endTime}:00Z`).getTime();
          const durationInHours = (end - start) / (1000 * 60 * 60);
          totalPrice += durationInHours * ratePerHour;
        }

        results.push({
          machineID,
          machineName: machine.serialNumber,
          totalPrice,
          ratePerHour,
        });
      } catch (error) {
        errors.push({
          machineID,
          error: (error as Error).message,
        });
      }
    }

    res.status(207).json({
      results,
      errors,
      summary: {
        total: machineIDs.length,
        successful: results.length,
        failed: errors.length,
        totalPriceAllMachines: results.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
*/
