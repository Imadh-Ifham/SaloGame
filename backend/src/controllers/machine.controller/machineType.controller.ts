import { Request, Response } from "express";
import MachineType from "../../models/machine.model/machineType.model";

export const createMachineType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      supportedGames,
      specifications,
      rateByPlayers, // Updated to rateByPlayers
      imageUrl,
    } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({ message: "Name is required." });
      return;
    }

    if (!rateByPlayers || typeof rateByPlayers !== "object") {
      res.status(400).json({
        message:
          "Invalid rate format. rateByPlayers should be an object with player counts as keys.",
      });
      return;
    }

    // Validate that rateByPlayers values are numbers
    for (const [key, value] of Object.entries(rateByPlayers)) {
      if (isNaN(Number(key)) || typeof value !== "number" || value <= 0) {
        res.status(400).json({
          message: `Invalid rate value. Expected a number greater than 0 for key '${key}', received '${value}'.`,
        });
        return;
      }
    }

    // Create new MachineType
    const newMachineType = new MachineType({
      name,
      description,
      supportedGames,
      specifications,
      rateByPlayers, // Use the validated rateByPlayers object
      imageUrl,
    });

    // Save to database
    const savedMachineType = await newMachineType.save();
    res.status(201).json({
      message: "Machine type created successfully.",
      machineType: savedMachineType,
    });
  } catch (error: any) {
    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      res
        .status(400)
        .json({ message: "Validation Error", error: error.message });
      return;
    }

    // Handle duplicate key errors (e.g., if `name` should be unique)
    if (error.code === 11000) {
      res.status(409).json({ message: "Machine type already exists." });
      return;
    }

    // Handle unexpected errors
    res.status(500).json({
      message: "An unexpected error occurred while creating the machine type.",
      error: (error as Error).message,
    });
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
    const { gameIDs } = req.body;

    const machineType = await MachineType.findByIdAndUpdate(
      machineTypeID,
      { $addToSet: { supportedGames: gameIDs } },
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
