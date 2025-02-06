import mongoose, { Schema } from "mongoose";
import { MachineAvailability } from "../models/machine.model/machineAvailability.model";

class SlotMonitorService {
  private static instance: SlotMonitorService;
  private monitoringJobs: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): SlotMonitorService {
    if (!this.instance) {
      this.instance = new SlotMonitorService();
    }
    return this.instance;
  }

  private convertToSriLankaTime(date: Date, timeString: string): Date {
    // Parse hours and minutes
    const [hours, minutes] = timeString.split(":").map(Number);

    // Create a new date object with the input date
    const sriLankaDate = new Date(date);

    // Set the time components
    sriLankaDate.setHours(hours, minutes, 0, 0);

    console.log(
      `Converting ${date.toISOString()} ${timeString} to: ${sriLankaDate.toISOString()}`
    );
    return sriLankaDate;
  }

  async startMonitoring(
    machineId: mongoose.Types.ObjectId,
    date: Date,
    slotId: mongoose.Types.ObjectId
  ): Promise<void> {
    console.log("\n=== Starting Monitoring ===");
    console.log(`Machine ID: ${machineId}`);
    console.log(`Slot ID: ${slotId}`);
    console.log(`Date: ${date.toISOString()}`);

    if (
      !mongoose.isValidObjectId(machineId) ||
      !mongoose.isValidObjectId(slotId)
    ) {
      console.error("Invalid ObjectId provided");
      return;
    }

    const availability = await MachineAvailability.findOne({
      machineID: machineId,
      date: date,
    });

    if (!availability) {
      console.error("Availability not found");
      return;
    }

    const currentSlot = availability.bookedSlots.find(
      (slot) => slot._id.toString() === slotId.toString()
    );

    if (!currentSlot || currentSlot.status !== "In-Use") {
      console.error("Current slot not found or not in use");
      return;
    }

    console.log("\nSlot Times:");
    console.log(`Start Time: ${currentSlot.startTime}`);
    console.log(`End Time: ${currentSlot.endTime}`);

    // Convert times to Sri Lanka timezone
    const originalStart = this.convertToSriLankaTime(
      date,
      currentSlot.startTime
    );
    const originalEnd = this.convertToSriLankaTime(date, currentSlot.endTime);
    const currentTime = new Date();

    console.log("\nTime Calculations:");
    console.log(`Original Start: ${originalStart.toISOString()}`);
    console.log(`Original End: ${originalEnd.toISOString()}`);
    console.log(`Current Time: ${currentTime.toISOString()}`);

    // Get original booking duration in milliseconds
    const bookedDuration = originalEnd.getTime() - originalStart.getTime();
    console.log(
      `Booked Duration: ${bookedDuration}ms (${bookedDuration / 60000} minutes)`
    );

    // Calculate when their full time would end based on current start
    const fullDurationEnd = new Date(currentTime.getTime() + bookedDuration);
    console.log(`Full Duration End: ${fullDurationEnd.toISOString()}`);

    // Calculate maximum possible extension (30 minutes after original end time)
    const maxExtensionTime = new Date(originalEnd.getTime() + 30 * 60000);
    console.log(`Max Extension Time: ${maxExtensionTime.toISOString()}`);

    // Use the earlier of fullDurationEnd or maxExtensionTime
    const potentialEndTime =
      fullDurationEnd < maxExtensionTime ? fullDurationEnd : maxExtensionTime;
    console.log(`Potential End Time: ${potentialEndTime.toISOString()}`);

    const jobKey = `${machineId}-${slotId}`;

    // Calculate the delay in milliseconds
    const delay = Math.max(0, originalEnd.getTime() - currentTime.getTime());
    console.log(`\nSetting timeout:`);
    console.log(`Delay: ${delay}ms (${delay / 60000} minutes)`);
    console.log(
      `Will trigger at: ${new Date(
        currentTime.getTime() + delay
      ).toISOString()}`
    );

    // Set timeout to check status when their full duration would be up
    const timeoutId = setTimeout(async () => {
      console.log(`\n=== Timeout Triggered ===`);
      console.log(`Time now: ${new Date().toISOString()}`);
      await this.checkAndUpdateSlot(
        machineId,
        date,
        slotId,
        originalEnd,
        potentialEndTime
      );
    }, delay);

    this.monitoringJobs.set(jobKey, timeoutId);
  }

  private async checkAndUpdateSlot(
    machineId: mongoose.Types.ObjectId,
    date: Date,
    slotId: mongoose.Types.ObjectId,
    originalEndTime: Date,
    potentialEndTime: Date
  ): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const availability = await MachineAvailability.findOne({
        machineID: machineId,
        date: date,
      }).session(session);

      if (!availability) {
        await session.abortTransaction();
        return;
      }

      // Check for next booking
      const nextBookedSlot = availability.bookedSlots.find((slot) => {
        const slotStartTime = this.convertToSriLankaTime(date, slot.startTime);
        return (
          slot.status === "Booked" &&
          slotStartTime > originalEndTime &&
          slotStartTime <= potentialEndTime
        );
      });

      // If there's a next booking, we can only extend until that booking starts
      const actualEndTime = nextBookedSlot
        ? this.convertToSriLankaTime(date, nextBookedSlot.startTime)
        : potentialEndTime;

      // Convert to HH:mm format
      const endTimeString = actualEndTime.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      // Update the slot
      await MachineAvailability.updateOne(
        {
          machineID: machineId,
          date: date,
          "bookedSlots._id": slotId,
          __v: availability.__v, // Ensures no other modification happened
        },
        {
          $set: {
            "bookedSlots.$.endTime": endTimeString,
            "bookedSlots.$.status": "Done",
            "bookedSlots.$.isBooked": false,
          },
          $inc: { __v: 1 }, // Increment version
        },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error("Error in checkAndUpdateSlot:", error);
    } finally {
      session.endSession();
      const jobKey = `${machineId}-${slotId}`;
      this.monitoringJobs.delete(jobKey);
    }
  }

  stopMonitoring(
    machineId: mongoose.Types.ObjectId,
    slotId: mongoose.Types.ObjectId
  ): void {
    if (
      !mongoose.isValidObjectId(machineId) ||
      !mongoose.isValidObjectId(slotId)
    ) {
      console.error("Invalid ObjectId provided");
      return;
    }

    const jobKey = `${machineId}-${slotId}`;
    const timeoutId = this.monitoringJobs.get(jobKey);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.monitoringJobs.delete(jobKey);
    }
  }
}

export default SlotMonitorService;
