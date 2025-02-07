import { Request, Response } from "express";
import MachineGame from "../models/machineGame.model";
import Machine from "../models/machine.model/machine.model";
import Game from "../models/game.model";

// Get all games for a specific machine
export const getGamesForMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const machineGames = await MachineGame.find({
      machine: req.params.machineId,
    }).populate("game");
    res.status(200).json(machineGames);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all machines for a specific game
export const getMachinesForGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const machineGames = await MachineGame.find({
      game: req.params.gameId,
    }).populate("machine");
    res.status(200).json(machineGames);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Manually assign a game/s to a machine
export const assignGamesToMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineIds, gameId } = req.body;

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const machines = await Machine.find({ _id: { $in: machineIds } });
    if (machines.length !== machineIds.length) {
      res.status(404).json({ error: "One or more machines not found" });
      return;
    }

    const machineGames = machines.map((machine) => ({
      machine: machine._id,
      game: gameId,
    }));
    const result = await MachineGame.insertMany(machineGames);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error assigning games to machines:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Manually remove a game/s from a machine
export const removeGamesFromMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { machineIds, gameId } = req.body;

  try {
    const result = await MachineGame.deleteMany({
      machine: { $in: machineIds },
      game: gameId,
    });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Association not found" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Games removed from machine" });
  } catch (error) {
    console.error("Error removing games from machines:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Copy games from one machine to another
export const copyGamesToMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fromMachineId, toMachineId } = req.body;

  try {
    const fromMachineGames = await MachineGame.find({ machine: fromMachineId });
    if (fromMachineGames.length === 0) {
      res.status(404).json({ error: "No games found for the source machine" });
      return;
    }

    const toMachine = await Machine.findById(toMachineId);
    if (!toMachine) {
      res.status(404).json({ error: "Destination machine not found" });
      return;
    }

    const newMachineGames = fromMachineGames.map((machineGame) => ({
      machine: toMachineId,
      game: machineGame.game,
    }));
    const result = await MachineGame.insertMany(newMachineGames);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error copying games to machine:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
