import { IMachineBooking } from "../models/booking.model";
import Machine from "../models/machine.model/machine.model";
import MachineType from "../models/machine.model/machineType.model";

/**
 * Calculate total price based on selected machines, user count, and refined time rules.
 * @param startTime - Booking start time
 * @param endTime - Booking end time
 * @param machines - Array of machines with user count
 * @returns total price of the booking
 */
const calculateTotalPrice = async (
  startTime: Date,
  endTime: Date,
  machines: IMachineBooking[]
): Promise<number> => {
  try {
    if (!startTime || !endTime || !machines.length) {
      throw new Error("Invalid input: startTime, endTime, or machines missing");
    }

    // Calculate total duration in minutes
    const durationInMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (durationInMinutes <= 0) throw new Error("Invalid booking duration");

    // Extract full hours and remaining minutes
    const fullHours = Math.floor(durationInMinutes / 60);
    const remainingMinutes = durationInMinutes % 60;

    let totalPrice = 0;

    // Iterate through selected machines
    for (const machineBooking of machines) {
      const machine = await Machine.findById(machineBooking.machineID);
      if (!machine)
        throw new Error(`Machine not found: ${machineBooking.machineID}`);

      const machineType = await MachineType.findById(machine.machineType);
      if (!machineType)
        throw new Error(
          `MachineType not found for machine: ${machineBooking.machineID}`
        );

      const userCount = machineBooking.userCount || 1; // Default to 1 user

      // Fetch rate per hour based on the number of users (use bracket notation)
      const ratePerHour = machineType.rateByPlayers[userCount];
      if (!ratePerHour)
        throw new Error(
          `Rate not found for ${userCount} players in MachineType ${machineType.name}`
        );

      // Calculate price for full hours
      let machinePrice = fullHours * ratePerHour;

      // Handle extra minutes pricing
      if (remainingMinutes >= 15 && remainingMinutes < 45) {
        // Charge for 30 minutes
        const halfHourRate = ratePerHour / 2 + 0.1 * ratePerHour; // 50% + 10% of that
        machinePrice += halfHourRate;
      } else if (remainingMinutes >= 45) {
        // Charge full hour
        machinePrice += ratePerHour;
      }

      // Add machine price to total price
      totalPrice += machinePrice;
    }

    return totalPrice;
  } catch (error) {
    //console.error("Error calculating total price:", error);
    throw error;
  }
};

export default calculateTotalPrice;
