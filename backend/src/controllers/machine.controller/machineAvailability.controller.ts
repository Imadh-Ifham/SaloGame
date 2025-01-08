import { Request, Response } from "express";
import MachineAvailability from "../../models/machine.model/machineAvailability.model";
import { isOverlapping } from "../../utils/checkOverlap";
import mongoose, { Types } from "mongoose";

// 📌 Create or Book a Slot
export const createAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineID, date, bookedSlots } = req.body;

  try {
    const availability = await MachineAvailability.findOne({ machineID, date });

    if (!availability) {
      const newAvailability = new MachineAvailability({
        machineID,
        date,
        bookedSlots,
      });
      await newAvailability.save();
      res.status(201).json(newAvailability);
      return;
    }

    // At this point, TypeScript knows availability is not null
    const alreadyBooked = bookedSlots.some(
      (newSlot: { startTime: string; endTime: string }) =>
        isOverlapping(newSlot, availability.bookedSlots)
    );

    if (alreadyBooked) {
      res
        .status(400)
        .json({ message: "Some slots are already booked or overlapping." });
      return;
    }

    availability.bookedSlots.push(...bookedSlots);
    await availability.save();
    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

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
