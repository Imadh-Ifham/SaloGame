import { Request, Response } from "express";
import Machine from "../models/machine.model/machine.model";
import findFirstAndNextBooking from "../services/findFirstAndNextBooking";
import isSlotAvailable from "../services/isSlotAvailable";
import Booking from "../models/booking.model";
import calculateTotalPrice from "../services/calculatePrice";
import { getBookingStatus } from "../services/getBookingStatus";
import { createTransaction } from "./transaction.controller";
import { AuthRequest } from "../middleware/types";

// Define controller for fetching booking status for all the machines
export const getBookingStatusForAllMachines = async (
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

    // Step 2: Fetch booking statuses in parallel using Promise.all
    const entries = await Promise.all(
      machines.map(async (machine) => {
        const machineID = machine._id.toString();
        const status = await getBookingStatus(
          inputStartTime,
          duration,
          machineID
        );
        return [machineID, { status }];
      })
    );

    // Step 3: Convert the array to an object
    const bookingStatusDetails = Object.fromEntries(entries);

    // Step 4: Return the structured result
    res.json({
      success: true,
      data: bookingStatusDetails,
    });
  } catch (error) {
    console.error("Error fetching booking status:", error);

    // Return a structured error response
    res.status(500).json({
      success: false,
      error: "Error fetching booking status",
      message: (error as Error).message || "Something went wrong.",
    });
  }
};

export const getFirstAndNextBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      inputStartTime,
      duration,
      machineID,
    }: { inputStartTime: Date; duration: number; machineID: String } = req.body;

    if (!inputStartTime || !duration || !machineID) {
      res.status(400).json({
        error: "InputStartTime, duration & machineID are required fields.",
      });
      return;
    }

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

    const bookingDetails = {
      firstBooking: firstBooking ?? null, // Ensure it's null if undefined
      status: status,
      nextBooking: secondBooking ?? null, // Ensure it's null if undefined
    };

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
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
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
      res.status(400).json({
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

      let transactionType;

      mode === "admin"
        ? (transactionType = "walk-in-booking")
        : (transactionType = "online-booking");
      console.log("transactionType", transactionType);

      // Create transaction
      const transactionReq = {
        user: req.user,
        body: {
          paymentType: "cash", // or other payment type as required
          amount: totalPrice,
          transactionType: transactionType, // set the transaction type based on mode
        },
      };
      
      // Create a proper mock response that captures the transaction data
      let capturedTransactionData: any = null;
      const transactionRes = {
        status: (code: number) => ({
          json: (data: any) => {
            if (code !== 201) {
              throw new Error(data.message || "Transaction creation failed");
            }
            capturedTransactionData = data;
            return data;
          },
        }),
      } as Response;
      
      console.log("transactionReq", transactionReq);
      await createTransaction(
        transactionReq as AuthRequest,
        transactionRes as Response
      );
      console.log("transactionRes", capturedTransactionData);

      // Update booking with transaction ID
      if (capturedTransactionData && capturedTransactionData.transaction && capturedTransactionData.transaction._id) {
        newBooking.transactionID = capturedTransactionData.transaction._id;
        await newBooking.save({ session });
      }

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

export const updateBookingStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      bookingID,
      status,
    }: {
      bookingID: string;
      status: "Booked" | "InUse" | "Completed" | "Cancelled";
    } = req.body;

    if (!bookingID || !status) {
      res.status(400).json({ message: "Booking ID and status are required." });
      return;
    }

    const booking = await Booking.findById(bookingID);

    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    booking.status = status;
    await booking.save();

    res.json({ message: "Booking status updated successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected server error",
      error: (error as Error).message,
    });
  }
};

export const getBookingByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingID } = req.params;

    if (!bookingID) {
      res.status(400).json({ message: "Booking ID is required." });
      return;
    }

    const booking = await Booking.findById(bookingID).populate({
      path: "transactionID",
      select: "-userID", // Exclude userID
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    res.json({ status: "Success", data: booking });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected server error",
      error: (error as Error).message,
    });
  }
};
