import { Request, Response } from "express";
import { MachineAvailability } from "../../models/machine.model/machineAvailability.model";
import User from "../../models/user.model";
// import { reserveBooking } from "../booking.controller";
import SlotMonitorService from "../../services/slotMonitoringService";
import { isOverlapping } from "../../utils/checkOverlap";
import mongoose, { Types } from "mongoose";

const VALID_STATUSES = ["Booked", "In-Use", "Done"] as const;
type SlotStatus = (typeof VALID_STATUSES)[number];

// Maximum number of retries for handling write conflicts
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 100;

/**
 * Helper function to add delay between retries
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Updates the status of a booking slot with retry mechanism
 */
export const updateSlotStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { slotId, machineId, date, status } = req.body;

  // Input validation
  try {
    if (!slotId || !machineId || !date || !status) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    if (!VALID_STATUSES.includes(status as SlotStatus)) {
      res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }

    if (
      !mongoose.isValidObjectId(slotId) ||
      !mongoose.isValidObjectId(machineId)
    ) {
      res.status(400).json({ message: "Invalid slotId or machineId format" });
      return;
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    // Retry loop for handling write conflicts
    let lastError: any = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Find the current slot with session
        const currentAvailability = await MachineAvailability.findOne({
          machineID: new mongoose.Types.ObjectId(machineId),
          date: parsedDate,
          "bookedSlots._id": new mongoose.Types.ObjectId(slotId),
        }).session(session);

        if (!currentAvailability) {
          await session.abortTransaction();
          res.status(404).json({ message: "Slot not found" });
          return;
        }

        const currentSlot = currentAvailability.bookedSlots.find(
          (slot) => slot._id.toString() === slotId
        );

        if (!currentSlot) {
          await session.abortTransaction();
          res.status(404).json({ message: "Slot not found" });
          return;
        }

        // Status transition validation
        if (currentSlot.status === "Done") {
          await session.abortTransaction();
          res.status(400).json({
            message: "Cannot change status of a completed slot",
          });
          return;
        }

        if (currentSlot.status === "In-Use" && status === "Booked") {
          await session.abortTransaction();
          res.status(400).json({
            message: "Cannot change status from In-Use back to Booked",
          });
          return;
        }

        // Prepare update data
        const updateData: any = {
          "bookedSlots.$.status": status,
        };

        if (status === "Done") {
          updateData["bookedSlots.$.isBooked"] = false;
        }

        // Use findOneAndUpdate with optimistic concurrency control
        const updatedAvailability = await MachineAvailability.findOneAndUpdate(
          {
            machineID: new mongoose.Types.ObjectId(machineId),
            date: parsedDate,
            "bookedSlots._id": new mongoose.Types.ObjectId(slotId),
            // Add version check for optimistic concurrency
            __v: currentAvailability.__v,
          },
          {
            $set: updateData,
            $inc: { __v: 1 }, // Increment version
          },
          {
            new: true,
            session,
            runValidators: true,
          }
        );

        if (!updatedAvailability) {
          throw new Error("Concurrent modification detected");
        }

        // Handle monitoring state changes
        if (status === "In-Use") {
          const updatedSlot = updatedAvailability.bookedSlots.find(
            (slot) => slot._id.toString() === slotId
          );

          if (updatedSlot && updatedSlot.status === "In-Use") {
            await SlotMonitorService.getInstance().startMonitoring(
              new mongoose.Types.ObjectId(machineId),
              parsedDate,
              new mongoose.Types.ObjectId(slotId)
            );
          }
        } else if (status === "Done") {
          SlotMonitorService.getInstance().stopMonitoring(
            new mongoose.Types.ObjectId(machineId),
            new mongoose.Types.ObjectId(slotId)
          );
        }

        await session.commitTransaction();
        res.status(200).json({
          message: `Slot status successfully updated to ${status}`,
          data: updatedAvailability,
        });
        return;
      } catch (error) {
        await session.abortTransaction();
        lastError = error;

        // If it's a write conflict, retry after delay
        if (
          (error as any).code === 112 ||
          (error as Error).message === "Concurrent modification detected"
        ) {
          if (attempt < MAX_RETRIES - 1) {
            await delay(RETRY_DELAY_MS * Math.pow(2, attempt)); // Exponential backoff
            continue;
          }
        } else {
          // For other errors, don't retry
          throw error;
        }
      } finally {
        session.endSession();
      }
    }

    // If we get here, all retries failed
    res.status(500).json({
      message: "Failed to update slot status after multiple retries",
      error:
        lastError instanceof Error
          ? lastError.message
          : "Unknown error occurred",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating slot status",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Stops monitoring a specific slot
 */
export const stopSlotMonitoring = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { slotId, machineId } = req.body;

  try {
    // Validate required fields
    if (!slotId || !machineId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Validate MongoDB ObjectIds
    if (
      !mongoose.isValidObjectId(slotId) ||
      !mongoose.isValidObjectId(machineId)
    ) {
      res.status(400).json({ message: "Invalid slotId or machineId format" });
      return;
    }

    SlotMonitorService.getInstance().stopMonitoring(
      new mongoose.Types.ObjectId(machineId),
      new mongoose.Types.ObjectId(slotId)
    );

    res.status(200).json({ message: "Monitoring stopped successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error stopping monitoring",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export default {
  updateSlotStatus,
  stopSlotMonitoring,
};
/*
export const createAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineIDs, date, bookedSlots, userID, userName, phoneNumber } =
    req.body;

  // Validate input
  if (!Array.isArray(machineIDs) || machineIDs.length === 0) {
    res.status(400).json({ message: "machineIDs must be a non-empty array" });
    return;
  }

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validationResults = [];
    const availabilityUpdates = [];

    // First phase: Validate all machines without making any changes
    for (const machineID of machineIDs) {
      try {
        const availability = await MachineAvailability.findOne({
          machineID,
          date,
        }).session(session);

        if (!availability) {
          // Store information for creating new availability
          validationResults.push({
            machineID,
            action: "create",
            availability: new MachineAvailability({
              machineID,
              date,
              bookedSlots: bookedSlots.map(
                (slot: { startTime: string; endTime: string }) => ({
                  ...slot,
                  reservedAt: new Date(),
                  isBooked: false,
                })
              ),
            }),
          });
          continue;
        }

        // Check for overlapping slots
        const alreadyBookedOrOverlapping = bookedSlots.some(
          (newSlot: { startTime: string; endTime: string }) =>
            isOverlapping(
              newSlot,
              availability.bookedSlots.filter((slot) => slot.isBooked)
            )
        );

        if (alreadyBookedOrOverlapping) {
          throw new Error(
            `Machine ${machineID} has overlapping or booked slots`
          );
        }

        // Store information for updating existing availability
        validationResults.push({
          machineID,
          action: "update",
          availability,
          newSlots: bookedSlots.map(
            (slot: { startTime: string; endTime: string }) => ({
              ...slot,
              reservedAt: new Date(),
              isBooked: false,
            })
          ),
        });
      } catch (error) {
        // If any machine fails validation, return error immediately
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({
          message: "Cannot reserve machines",
          error: `${(error as Error).message}. No machines were reserved.`,
        });
        return;
      }
    }

    // Second phase: Apply all changes since validation passed
    for (const result of validationResults) {
      if (result.action === "create") {
        const savedAvailability = await result.availability.save({ session });
        availabilityUpdates.push({
          machineID: result.machineID,
          status: "created",
          data: savedAvailability,
        });
      } else {
        // Update existing availability
        result.availability.bookedSlots.push(...result.newSlots);
        const savedAvailability = await result.availability.save({ session });
        availabilityUpdates.push({
          machineID: result.machineID,
          status: "updated",
          data: savedAvailability,
        });
      }
    }

    // Commit the transaction if all operations are successful
    await session.commitTransaction();
    session.endSession();

    // After committing the transaction, check the user role if userID is provided
    if (userID) {
      const user = await User.findById(userID);
      if (user && (user.role === "owner" || user.role === "manager")) {
        // Prepare a new request object for createBooking
        const bookingReq = {
          ...req,
          body: {
            userID,
            userName,
            phoneNumber,
            machineIDs,
            date,
            bookedSlots,
          },
        };

        // Call createBooking if the user is an owner or manager
        await reserveBooking(bookingReq as Request, res);
        return; // Return to avoid sending another response
      }
    }

    // All operations successful
    res.status(200).json({
      message: "All machines successfully reserved",
      results: availabilityUpdates,
      summary: {
        total: machineIDs.length,
        successful: availabilityUpdates.length,
      },
    });
  } catch (error) {
    // Rollback transaction on any error
    try {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
    } catch (abortError) {
      console.error("Error aborting transaction:", abortError);
    } finally {
      session.endSession();
    }

    res.status(500).json({
      error: "Server error occurred. No machines were reserved.",
      details: (error as Error).message,
    });
  }
};
*/
// 📌 Extend Booking Controller
export const alterBookingSlot = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { slotID, minutes } = req.body;
  const { action } = req.query;

  try {
    const availability = await MachineAvailability.findOne({
      "bookedSlots._id": Types.ObjectId.createFromHexString(slotID),
    });

    if (!availability) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    const slot = availability.bookedSlots.find(
      (s) => s._id.toString() === slotID
    );

    if (!slot) {
      res.status(404).json({ message: "Slot not found." });
      return;
    }

    const oldEndTime = new Date(`1970-01-01T${slot.endTime}`);
    let formattedNewEndTime: string;

    if (action === "extend") {
      const newEndTime = new Date(oldEndTime.getTime() + minutes * 60000);
      formattedNewEndTime = newEndTime.toTimeString().slice(0, 5);

      const newSlotData = {
        startTime: slot.startTime,
        endTime: formattedNewEndTime,
      };
      const otherSlots = availability.bookedSlots.filter(
        (s) => s._id.toString() !== slotID
      );

      if (isOverlapping(newSlotData, otherSlots)) {
        res
          .status(400)
          .json({ message: "Extension overlaps with other bookings." });
        return;
      }
    } else {
      const newEndTime = new Date(oldEndTime.getTime() - minutes * 60000);
      formattedNewEndTime = newEndTime.toTimeString().slice(0, 5);
    }

    slot.endTime = formattedNewEndTime;
    await availability.save();

    res.status(200).json({
      message:
        action === "extend"
          ? `Booking slot extended by ${minutes} minutes successfully.`
          : `Booking slot reduced by ${minutes} minutes successfully.`,
      availability,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// 📌 Get Booked Slots for a Machine and Date
export const getBookedSlots = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineID, date } = req.body;

  try {
    const availability = await MachineAvailability.findOne({ machineID, date });

    if (!availability) {
      res.status(404).json({ message: "No booking found for this date." });
      return;
    }

    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// 📌 Remove a Booking Slot
export const removeBookingSlot = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineID, date, slotID } = req.body;

  try {
    const availability = await MachineAvailability.findOne({ machineID, date });

    if (!availability) {
      res.status(404).json({ message: "No booking found for this date." });
      return;
    }

    // ✅ Correctly filter by ObjectId comparison
    availability.bookedSlots = availability.bookedSlots.filter(
      (s) => s._id.toString() !== slotID
    );

    // ✅ Save changes
    await availability.save();
    res
      .status(200)
      .json({ message: "Booking slot removed successfully.", availability });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// 📌 Get Available Slots for a Machine and Date
export const getAvailableSlots = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineID, date } = req.query;

  try {
    const availability = await MachineAvailability.findOne({ machineID, date });

    if (!availability) {
      // If no entry exists, all slots are available
      res.status(200).json({ availableSlots: "All slots are available." });
      return;
    }

    res.status(200).json({ bookedSlots: availability.bookedSlots });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// 📌 Delete Entire Machine Availability for a Date
export const deleteAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineID, date } = req.body;

  try {
    const result = await MachineAvailability.findOneAndDelete({
      machineID,
      date,
    });

    if (!result) {
      res.status(404).json({ message: "No availability found for this date." });
      return;
    }

    res.status(200).json({ message: "Availability deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
