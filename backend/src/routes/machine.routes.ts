import express from "express";
import {
  deleteMachine,
  getAllMachines,
  getMachineBySerialNumber,
  updateMachineSerialNumber,
  updateMachineStatus,
} from "../controllers/machine.controller/machine.controller";
import {
  createAvailability,
  deleteAvailability,
  extendBookingAvailability,
  getAvailableSlots,
  removeBookingSlot,
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
router.get("/", getAllMachines);
router.get("/:machineNum", getMachineBySerialNumber);
router.patch("/:machineNum/patch-serNum", updateMachineSerialNumber);
router.patch("/:machineNum/patch-status", updateMachineStatus);
router.delete("/:machineNum", deleteMachine);

// Machine Type Routes
router.post("/type", createMachineType);
router.get("/type", getAllMachineTypes);
router.get("/type/:machineTypeID", getMachineTypeById);
router.put("/type/:machineTypeID", updateMachineType);
router.delete("/type", deleteMachineType);
router.patch("/type/:machineTypeID/add-game", addGameToMachineType);
router.patch("/type/:machineTypeID/remove-game", removeGameFromMachineType);

// MachineAvailability Routes
router.post("/availability", createAvailability); // 📌 Create a new machine Availability
router.patch("/availability/extend", extendBookingAvailability); // 📌 Extend a booking
router.patch("/availability/remove-slot", removeBookingSlot); // 📌 Remove a specific booking slot
router.get("/availability/available-slots", getAvailableSlots); // 📌 Get available slots for a specific machine and date
router.delete("/availability", deleteAvailability); // 📌 Delete entire availability for a date

export default router;
