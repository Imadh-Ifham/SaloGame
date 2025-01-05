import { Request, Response } from "express";
import Machine from "../../models/machine.model/machine.model";

// Retrieve all Machines
export const getAllMachines = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const machines = await Machine.find();
    res.status(200).json({ success: true, data: machines });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching all Machines",
      error: (error as Error).message,
    });
  }
};

// Retrieve Machine by SerialNumber
export const getMachineBySerialNumber = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineNum } = req.params;

  try {
    const machine = await Machine.findOne({ serialNumber: machineNum });

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
      { serialNumber: machineNum },
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
      { serialNumber: machineNum },
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
      serialNumber: machineNum,
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
