// Import the Game model
import { Request, Response } from "express";
import mongoose from "mongoose";
import Game from "../models/game.model";

export const getAllGames = async (
  req: Request,
  res: Response
): Promise<void> => {
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

export const getGameById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { gameID } = req.params;

  try {
    const game = await Game.findById(gameID);

    if (!game) {
      res.status(404).json({ success: false, message: "Game not found" });
      return;
    }

    res.status(200).json({ success: true, data: game });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

// Controller to create a new game
export const createGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, rating, image } = req.body;
  try {
    if (!name || !description) {
      res
        .status(400)
        .json({ success: false, message: "Name and description are required" });
      return;
    }

    const newGame = new Game({ name, description, rating, image });
    await newGame.save();

    res.status(201).json({ success: true, data: newGame });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

export const updateGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { gameID } = req.params;
  const { name, description, rating, image } = req.body;

  try {
    if (!name || !description) {
      res
        .status(400)
        .json({ success: false, message: "Name and description are required" });
      return;
    }

    const updatedGame = await Game.findByIdAndUpdate(
      gameID,
      { name, description, rating, image },
      { new: true, runValidators: true }
    );

    if (!updatedGame) {
      res.status(404).json({ success: false, message: "Game not found" });
      return;
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

export const deleteGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { gameID } = req.params;

  try {
    const deletedGame = await Game.findByIdAndDelete(gameID);

    if (!deletedGame) {
      res.status(404).json({ success: false, message: "Game not found" });
      return;
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
