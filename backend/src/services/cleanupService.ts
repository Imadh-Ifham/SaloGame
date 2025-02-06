import { CronJob } from "cron";
import { MachineAvailability } from "../models/machine.model/machineAvailability.model";

export class CleanupService {
  private static STALE_SLOT_MINUTES = 5;

  static initializeCleanupJob() {
    const job = new CronJob(
      "* * * * *", // Run every 5 minutes
      this.cleanupUnbookedSlots.bind(this),
      null,
      true // Start the job right away
    );
    return job;
  }

  static async cleanupUnbookedSlots() {
    try {
      const fiveMinutesAgo = new Date(
        Date.now() - this.STALE_SLOT_MINUTES * 60 * 1000
      );

      // Use updateMany with $pull to remove only unbooked slots
      const result = await MachineAvailability.updateMany(
        {},
        {
          $pull: {
            bookedSlots: {
              isBooked: false,
              reservedAt: { $lt: fiveMinutesAgo },
            },
          },
        },
        { multi: true } // Ensure multiple documents can be updated
      );

      console.log(
        `Cleaned up unbooked slots. Modified ${result.modifiedCount} documents`
      );
    } catch (error) {
      console.error("Error cleaning up unbooked slots:", error);
    }
  }
}
