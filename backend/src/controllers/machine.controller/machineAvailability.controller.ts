import { Request, Response } from "express";
import MachineAvailability from "../../models/machine.model/machineAvailability.model";

// 📌 Create or Book a Slot
export const createAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineID, date, bookedSlots } = req.body;

  try {
    let availability = await MachineAvailability.findOne({ machineID, date });

    if (!availability) {
      // If no entry for the date, create a new one
      availability = new MachineAvailability({ machineID, date, bookedSlots });
    } else {
      // Prevent double booking
      const existingSlots = availability.bookedSlots;
      const alreadyBooked = bookedSlots.some((slot: string) =>
        existingSlots.includes(slot)
      );

      if (alreadyBooked) {
        res.status(400).json({ message: "Some slots are already booked." });
        return;
      }

      // Add the new slots
      availability.bookedSlots.push(...bookedSlots);
    }

    await availability.save();
    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// 📌 Extend Booking
export const extendBookingAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineID, date, slot } = req.body;

  try {
    const availability = await MachineAvailability.findOne({ machineID, date });

    if (!availability) {
      res.status(404).json({ message: "No booking found for this date." });
      return;
    }

    // Check if the slot is available
    if (availability.bookedSlots.includes(slot)) {
      res.status(400).json({ message: "Slot already booked." });
      return;
    }

    // Add the extended slot
    availability.bookedSlots.push(slot);
    await availability.save();
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
  const { machineID, date, slot } = req.body;

  try {
    const availability = await MachineAvailability.findOne({ machineID, date });

    if (!availability) {
      res.status(404).json({ message: "No booking found for this date." });
      return;
    }

    // Remove the slot if it exists
    availability.bookedSlots = availability.bookedSlots.filter(
      (s) => s !== slot
    );

    await availability.save();
    res.status(200).json(availability);
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
