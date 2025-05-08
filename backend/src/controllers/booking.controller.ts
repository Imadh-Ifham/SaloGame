import { Request, Response } from "express";
import Machine from "../models/machine.model/machine.model";
import findFirstAndNextBooking from "../services/findFirstAndNextBooking";
import isSlotAvailable from "../services/isSlotAvailable";
import Booking from "../models/booking.model";
import calculateTotalPrice from "../services/calculatePrice";
import { getBookingStatus } from "../services/getBookingStatus";
import { createTransaction } from "./transaction.controller";
import { AuthRequest } from "../middleware/types";
import { BookingReportData } from "../types/booking";
import { calculateStartDate } from "../services/bookingReportService";
import Transaction from "../models/transaction.model";

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
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
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
      status = firstBooking.booking.status; // Adjust logic as needed
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

    // Set status to "Booked" if the startTime is in the future
    let finalStatus = status;
    if (start > new Date()) {
      finalStatus = "Booked"; // Change the status to "Booked" if the start time is greater than current time
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
        status: finalStatus,
      });

      await newBooking.save({ session });

      let transactionType;

      mode === "admin"
        ? (transactionType = "walk-in-booking")
        : (transactionType = "online-booking");

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

      await createTransaction(
        transactionReq as AuthRequest,
        transactionRes as Response
      );

      // Update booking with transaction ID
      if (
        capturedTransactionData &&
        capturedTransactionData.transaction &&
        capturedTransactionData.transaction._id
      ) {
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
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const { bookingID } = req.params;

    if (!bookingID) {
      res.status(400).json({ message: "Booking ID is required." });
      return;
    }

    const booking = await Booking.findById(bookingID)
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
    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    // Extract transaction details separately
    const { transactionID, ...bookingData } = booking; // Convert Mongoose document to plain object

    // Separate booking and transaction
    const structuredResponse = {
      booking: bookingData,
      transaction: transactionID || null, // Ensure transaction is explicitly null if not present
    };

    res.json({ status: "Success", data: structuredResponse });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected server error",
      error: (error as Error).message,
    });
  }
};

export const getBookingLog = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { status, date, filterType, count } = req.body;
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (date && filterType) {
      const selectedDate = new Date(date);
      if (filterType === "day") {
        query.startTime = {
          $gte: selectedDate.setHours(0, 0, 0, 0),
          $lt: selectedDate.setHours(23, 59, 59, 999),
        };
      } else if (filterType === "month") {
        query.startTime = {
          $gte: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            1
          ),
          $lt: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            1
          ),
        };
      }
    }

    const limit = count || 20; // Default to 20 if count is not provided

    const bookings = await Booking.find(query)
      .select("customerName startTime status transactionID") // Include transactionID for population
      .populate({
        path: "transactionID",
        select: "transactionType -_id",
      })
      .sort({ startTime: -1 }) // Sort by startTime in descending order
      .limit(limit) // Limit the number of results based on the count
      .lean(); // Converts Mongoose documents to plain objects
    const structuredResponse = bookings.map((booking) => ({
      _id: booking._id,
      customerName: booking.customerName,
      startTime: booking.startTime,
      status: booking.status,
      transactionType:
        (booking.transactionID as { transactionType?: string })
          ?.transactionType || null,
    }));

    res.json({ status: "Success", data: structuredResponse });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected server error",
      error: (error as Error).message,
    });
  }
};

// Function to generate booking report
export const generateReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const period: string = req.query.period as string;
    const startDate = calculateStartDate(period);
    const endDate = new Date();

    const bookings = await Booking.find({
      startTime: { $gte: startDate, $lte: endDate },
    })
      .populate<{ transactionID: { amount: number } }>("transactionID")
      .populate("userID")
      .populate("machines.machineID")
      .lean();

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(
      (booking) => booking.status === "Completed"
    ).length;
    const totalRevenue = bookings.reduce((acc, booking) => {
      if (booking.transactionID?.amount) {
        return acc + booking.transactionID.amount;
      }
      return acc;
    }, 0);
    const averageBookingValue = totalRevenue / totalBookings;

    const bookingsByStatus: Record<string, number> = bookings.reduce(
      (acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const bookingsByMachine: Record<string, number> = await bookings.reduce(
      async (accPromise, booking) => {
        const acc = await accPromise;
        for (const machine of booking.machines) {
          const machineDoc = await Machine.findById(machine.machineID);
          if (machineDoc) {
            const serialNumber = machineDoc.serialNumber;
            acc[serialNumber] = (acc[serialNumber] || 0) + 1;
          }
        }
        return acc;
      },
      Promise.resolve({} as Record<string, number>)
    );

    const reportData: BookingReportData = {
      metrics: {
        totalBookings,
        completedBookings,
        totalRevenue,
        averageBookingValue,
        bookingsByStatus,
        bookingsByMachine,
      },
      startDate,
      endDate,
    };

    res.status(200).json(reportData);
  } catch (error) {
    res.status(500).json({
      message: "Unexpected server error",
      error: (error as Error).message,
    });
  }
};

export const endBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { bookingID, endTime, paymentType } = req.body;

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    // Validate input
    if (!bookingID || !endTime || !paymentType) {
      throw new Error("Missing required fields");
    }

    // Fetch the booking
    const booking = await Booking.findById(bookingID).session(session);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const newEndTime = new Date(endTime);
    const newStartTime = new Date(booking.startTime);

    // Calculate the total price
    const totalPrice = await calculateTotalPrice(
      newStartTime,
      newEndTime,
      booking.machines
    );

    // Fetch the transaction
    const transaction = await Transaction.findById(
      booking.transactionID
    ).session(session);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Update the transaction details
    transaction.paymentType = paymentType;
    transaction.amount = totalPrice;
    transaction.status = "completed";
    await transaction.save({ session });

    // Update the booking details
    booking.endTime = endTime;
    booking.status = "Completed";
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Booking ended successfully", booking });
  } catch (error) {
    console.error("Error ending booking:", error);
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ error: "An error occurred while ending the booking" });
  }
};

export const startBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { bookingID, endTime, startTime } = req.body;

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    // Validate input
    if (!bookingID || !endTime || !startTime) {
      throw new Error("Missing required fields");
    }

    // Fetch the booking
    const booking = await Booking.findById(bookingID).session(session);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Update the booking details
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.status = "InUse";
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Booking started successfully", booking });
  } catch (error) {
    console.error("Error ending booking:", error);
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ error: "An error occurred while ending the booking" });
  }
};

export const getUpcomingBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    // Get current date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get day after tomorrow
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find upcoming bookings that are today or tomorrow
    // Only get bookings with status "Booked" or "InUse"
    const bookings = await Booking.find({
      startTime: { $gte: today, $lt: dayAfterTomorrow },
      status: { $in: ["Booked", "InUse"] }
    })
      .populate({
        path: "machines.machineID",
        select: "machineCategory serialNumber",
      })
      .populate({
        path: "transactionID",
        select: "amount paymentType status",
      })
      .sort({ startTime: 1 })
      .lean();

    // Group bookings by day (today or tomorrow)
    const todayBookings = bookings.filter(booking => 
      booking.startTime >= today && booking.startTime < tomorrow
    );

    const tomorrowBookings = bookings.filter(booking => 
      booking.startTime >= tomorrow && booking.startTime < dayAfterTomorrow
    );

    // Format bookings for frontend consumption
    const formatBooking = (booking: any) => {
      // Calculate duration in minutes
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      
      // Format duration as string (e.g., "30 mins")
      const duration = `${durationMinutes} mins`;
      
      // Format machines array for frontend
      const machines = booking.machines.map((machine: any) => {
        // Ensure machine type is either 'pc' or 'console'
        const machineCategory = (machine.machineID.machineCategory || "").toLowerCase();
        const type = machineCategory === 'console' ? 'console' : 'pc';
        
        return {
          name: machine.machineID.serialNumber,
          type
        };
      });

      // Format start time (e.g., "14:00")
      const formattedStartTime = startTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      // Map booking status to UI status
      let uiStatus: "Confirmed" | "Pending" | "In Use";
      switch(booking.status) {
        case "InUse":
          uiStatus = "In Use";
          break;
        case "Booked":
          uiStatus = "Confirmed";
          break;
        default:
          uiStatus = "Pending";
      }

      // Get payment status from transaction
      const paymentStatus: "Paid" | "Unpaid" = booking.transactionID && 
        booking.transactionID.status === "completed" ? "Paid" : "Unpaid";

      // Get price from transaction
      const price = booking.transactionID ? booking.transactionID.amount.toString() : "0";

      return {
        id: booking._id,
        customerName: booking.customerName,
        machines,
        startTime: formattedStartTime,
        duration,
        status: uiStatus,
        description: booking.notes || "",
        price,
        paymentStatus
      };
    };

    // Structure response
    const response = {
      today: todayBookings.map(formatBooking),
      tomorrow: tomorrowBookings.map(formatBooking)
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching upcoming bookings",
      message: (error as Error).message || "Something went wrong."
    });
  }
};
