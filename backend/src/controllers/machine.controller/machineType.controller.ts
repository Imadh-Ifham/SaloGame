import { Request, Response } from "express";
import MachineType from "../../models/machine.model/machineType.model";

// Create MachineType
export const createMachineType = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      supportedGames,
      specifications,
      rate,
      imageUrl,
    } = req.body;

    const newMachineType = new MachineType({
      name,
      description,
      supportedGames,
      specifications,
      rate,
      imageUrl,
    });

    const savedMachineType = await newMachineType.save();
    res.status(201).json(savedMachineType);
  } catch (error) {
    res.status(500).json({ message: "Error creating machine type", error });
  }
};

// Get all MachineTypes
export const getAllMachineTypes = async (req: Request, res: Response) => {
  try {
    const machineTypes = await MachineType.find().populate("supportedGames");
    res.status(200).json(machineTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching machine types", error });
  }
};

// Get MachineType by ID
export const getMachineTypeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { machineTypeID } = req.params;
    const machineType = await MachineType.findById(machineTypeID).populate(
      "supportedGames"
    );
    if (!machineType) {
      res.status(404).json({ message: "Machine type not found" });
      return;
    }
    res.status(200).json(machineType);
  } catch (error) {
    res.status(500).json({ message: "Error fetching machine type", error });
  }
};

// Update MachineType
export const updateMachineType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { machineTypeID } = req.params;
    const updatedMachineType = await MachineType.findByIdAndUpdate(
      machineTypeID,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedMachineType) {
      res.status(404).json({ message: "Machine type not found" });
      return;
    }

    res.status(200).json(updatedMachineType);
  } catch (error) {
    res.status(500).json({ message: "Error updating machine type", error });
  }
};

// Delete MachineType
export const deleteMachineType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { machineTypeID } = req.params;
    const deletedMachineType = await MachineType.findByIdAndDelete(
      machineTypeID
    );
    if (!deletedMachineType) {
      res.status(404).json({ message: "Machine type not found" });
      return;
    }
    res.status(200).json({ message: "Machine type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting machine type", error });
  }
};

// Add a game to MachineType
export const addGameToMachineType = async (req: Request, res: Response) => {
  try {
    const { machineTypeID } = req.params;
    const { gameID } = req.body;

    const machineType = await MachineType.findByIdAndUpdate(
      machineTypeID,
      { $addToSet: { supportedGames: gameID } },
      { new: true }
    ).populate("supportedGames");

    res.status(200).json(machineType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding game to machine type", error });
  }
};

// Remove a game from MachineType
export const removeGameFromMachineType = async (
  req: Request,
  res: Response
) => {
  try {
    const { machineTypeID } = req.params;
    const { gameID } = req.body;

    const machineType = await MachineType.findByIdAndUpdate(
      machineTypeID,
      { $pull: { supportedGames: gameID } },
      { new: true }
    ).populate("supportedGames");

    res.status(200).json(machineType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing game from machine type", error });
  }
};
