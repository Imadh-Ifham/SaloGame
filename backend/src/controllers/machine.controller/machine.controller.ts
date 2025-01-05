import { Request, Response } from "express";
import Machine from "../../models/machine.model/machine.model";

// Retrieve all Machines
export const getAllMachinesByType = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineType } = req.params;
  try {
    const machines = await Machine.find({ machineType });
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
  const { machineType, serialNumber } = req.body;
  try {
    const newMachine = new Machine({ machineType, serialNumber });

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
