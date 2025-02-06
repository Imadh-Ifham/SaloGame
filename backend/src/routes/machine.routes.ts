import express from "express";
import {
  createMachine,
  deleteMachine,
  getAllMachines,
  getMachineBySerialNumber,
  getMachineStatusController,
  updateMachineSerialNumber,
  updateMachineStatus,
} from "../controllers/machine.controller/machine.controller";
import {
  alterBookingSlot,
  //createAvailability,
  deleteAvailability,
  getAvailableSlots,
  getBookedSlots,
  removeBookingSlot,
  stopSlotMonitoring,
  updateSlotStatus,
} from "../controllers/machine.controller/machineAvailability.controller";
import {
  addGameToMachineType,
  createMachineType,
  deleteMachineType,
  getAllMachineTypes,
  getMachineTypeById,
  removeGameFromMachineType,
  updateMachineType,
} from "../controllers/machine.controller/machineType.controller";

const router = express.Router();

// Machine Routes
router.post("/", createMachine);
router.get("/get-all", getAllMachines);
router.get("/:machineNum/get-machine", getMachineBySerialNumber);
router.patch("/:machineNum/patch-serNum", updateMachineSerialNumber);
router.patch("/:machineNum/patch-status", updateMachineStatus);
router.delete("/:machineNum", deleteMachine);
router.get("/machine-status", getMachineStatusController);

// Machine Type Routes
router.post("/type", createMachineType);
router.get("/type", getAllMachineTypes);
router.get("/type/:machineTypeID", getMachineTypeById);
router.put("/type/:machineTypeID", updateMachineType);
router.delete("/type/:machineTypeID", deleteMachineType);
router.patch("/type/:machineTypeID/add-game", addGameToMachineType);
router.patch("/type/:machineTypeID/remove-game", removeGameFromMachineType);

// MachineAvailability Routes
//router.post("/availability", createAvailability); // 📌 Create a new machine Availability
router.patch("/availability/modify-slot", alterBookingSlot); // 📌 Extend a booking
router.get("/availability/booked-slots", getBookedSlots); // 📌 Get booked slots for a specific machine and date
router.patch("/availability/remove-slot", removeBookingSlot); // 📌 Remove a specific booking slot
router.get("/availability/available-slots", getAvailableSlots); // 📌 Get available slots for a specific machine and date
router.delete("/availability/delete", deleteAvailability); // 📌 Delete entire availability for a date
router.patch("/availability/update-status", updateSlotStatus);
router.post("/availability/stop-monitoring", stopSlotMonitoring);
export default router;
