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

export default router;
