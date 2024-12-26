// Import the Game model
import { Request, Response } from "express";
import mongoose from "mongoose";
import Game from "../models/game.model";

// Controller to get all games
export const getAllGames = async (req: Request, res: Response) => {
  try {
    const games = await Game.find();
    res.status(200).json({ success: true, data: games });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

export const getGameById = async (req: Request, res: Response) => {
  const { gameID } = req.params;

  try {
    // Validate ObjectID format
    if (!mongoose.Types.ObjectId.isValid(gameID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid game ID format",
      });
    }

    // Correct usage of findById
    const game = await Game.findById(gameID);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    res.status(200).json({
      success: true,
      data: game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

// Controller to create a new game
export const createGame = async (req: Request, res: Response) => {
  const { name, description, rating, image } = req.body;
  try {
    if (!name || !description) {
      res.status(400).json({ message: "Name and description are required" });
    }

    const newGame = new Game({ name, description, rating, image });
    await newGame.save();

    res.status(201).json(newGame);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

// Controller to update a game by ID
export const updateGame = async (req: Request, res: Response) => {
  try {
    const { name, description, rating, image } = req.body;
    const { gameID } = req.params;

    const updatedGame = await Game.findByIdAndUpdate(
      gameID,
      { name, description, rating, image },
      { new: true, runValidators: true }
    );

    if (!updatedGame) {
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    }

    res.status(200).json({ success: true, data: updatedGame });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

// Controller to delete a game by ID
export const deleteGame = async (req: Request, res: Response) => {
  try {
    const { gameID } = req.params;
    const deletedGame = await Game.findByIdAndDelete(gameID);

    if (!deletedGame) {
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Game deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};
