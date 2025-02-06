import { Request, Response } from "express";
import Machine from "../../models/machine.model/machine.model";
import { MachineAvailability } from "../../models/machine.model/machineAvailability.model";

interface IBookingDetails {
  bookingId: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface IMachineStatusDetails {
  currentBooking: IBookingDetails | null;
  nextBooking: IBookingDetails | null;
}

interface IMachineStatusResponse {
  [key: string]: IMachineStatusDetails;
}

export const getMachineStatusController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get current time in Sri Lanka
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Colombo",
    });

    // Get all machines
    const machines = await Machine.find().lean();

    // Initialize result object
    const machineStatus: IMachineStatusResponse = {};

    // Initialize all machines with null bookings
    machines.forEach((machine) => {
      if (machine._id) {
        machineStatus[machine._id.toString()] = {
          currentBooking: null,
          nextBooking: null,
        };
      }
    });

    // Get today's date in Sri Lanka timezone
    const nowInSL = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" })
    );
    const todayStart = new Date(nowInSL);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(nowInSL);
    todayEnd.setHours(23, 59, 59, 999);

    // Get all machine availabilities for today
    const availabilities = await MachineAvailability.find({
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    }).lean();

    // Process each availability
    for (const availability of availabilities) {
      const machineId = availability.machineID.toString();

      if (machineStatus[machineId]) {
        // Sort slots by start time
        const sortedSlots = [...availability.bookedSlots].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );

        for (const slot of sortedSlots) {
          const bookingDetails: IBookingDetails = {
            bookingId: slot._id.toString(),
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: slot.status,
          };

          // Check if this is a current booking
          if (isTimeInSlot(currentTime, slot.startTime, slot.endTime)) {
            machineStatus[machineId].currentBooking = bookingDetails;
          }
          // Check if this is the next booking (within 2 hours)
          else if (
            isNextBookingWithinTimeframe(currentTime, slot.startTime, 2) &&
            !machineStatus[machineId].nextBooking
          ) {
            machineStatus[machineId].nextBooking = bookingDetails;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: machineStatus,
      currentTime,
      timezone: "Asia/Colombo",
    });
  } catch (error) {
    console.error("Error in getMachineStatus:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

function isTimeInSlot(
  currentTime: string,
  startTime: string,
  endTime: string
): boolean {
  const current = convertTimeToMinutes(currentTime);
  const start = convertTimeToMinutes(startTime);
  const end = convertTimeToMinutes(endTime);
  return current >= start && current <= end;
}

function isNextBookingWithinTimeframe(
  currentTime: string,
  startTime: string,
  hoursAhead: number
): boolean {
  const current = convertTimeToMinutes(currentTime);
  const start = convertTimeToMinutes(startTime);
  return start > current && start <= current + hoursAhead * 60;
}

function convertTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Retrieve all Machines
export const getAllMachines = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const machines = await Machine.find().select(
      "_id serialNumber machineCategory status"
    );
    res.status(200).json({ success: true, data: machines });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching all Machines",
      error: (error as Error).message,
    });
  }
};

export const createMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineType, serialNumber, machineCategory } = req.body;
  try {
    const newMachine = new Machine({
      machineType,
      serialNumber,
      machineCategory,
    });

    const savedMachine = await newMachine.save();
    res.status(201).json({ success: true, data: savedMachine });
  } catch (error) {
    res.status(500).json({ message: "Error creating new machine" });
  }
};

// Retrieve Machine by SerialNumber
export const getMachineBySerialNumber = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineNum } = req.params;

  try {
    const machine = await Machine.findOne({
      serialNumber: new RegExp(`^${machineNum}$`, "i"),
    });

    if (!machine) {
      res.status(404).json({ success: false, message: "Machine not found" });
      return;
    }

    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

// Update Machine Serial Number
export const updateMachineSerialNumber = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineNum } = req.params;
  const { newSerialNumber } = req.body;

  try {
    const machine = await Machine.findOneAndUpdate(
      { serialNumber: new RegExp(`^${machineNum}$`, "i") },
      { serialNumber: newSerialNumber },
      { new: true, runValidators: true }
    );

    if (!machine) {
      res.status(404).json({ success: false, message: "Machine not found" });
      return;
    }

    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating serial number",
      error: (error as Error).message,
    });
  }
};

// Update Machine Status
export const updateMachineStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineNum } = req.params;
  const { newStatus } = req.body;

  try {
    const machine = await Machine.findOneAndUpdate(
      { serialNumber: new RegExp(`^${machineNum}$`, "i") },
      { status: newStatus },
      { new: true, runValidators: true }
    );

    if (!machine) {
      res.status(404).json({ success: false, message: "Machine not found" });
      return;
    }

    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: (error as Error).message,
    });
  }
};

// Delete Machine
export const deleteMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineNum } = req.params;

  try {
    const deletedMachine = await Machine.findOneAndDelete({
      serialNumber: new RegExp(`^${machineNum}$`, "i"),
    });

    if (!deletedMachine) {
      res.status(404).json({ success: false, message: "Machine not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Machine deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting machine",
      error: (error as Error).message,
    });
  }
};
