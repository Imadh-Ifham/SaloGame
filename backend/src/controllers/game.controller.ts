import { Request, Response } from "express";
import Game from "../models/game.model";
import { searchRawgGame } from "../services/rawgService";

// Get all games
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
      message: "Failed to fetch games. Please try again later.",
      error: (error as Error).message,
    });
  }
};

// Get game by ID
export const getGameById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { gameID } = req.params;

  try {
    const game = await Game.findById(gameID);

    if (!game) {
      res.status(404).json({ success: false, message: "Game not found." });
      return;
    }

    res.status(200).json({ success: true, data: game });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch the game. Please try again later.",
      error: (error as Error).message,
    });
  }
};

// Create a new game
export const createGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, rating, image } = req.body;

  try {
    if (!name) {
      res
        .status(400)
        .json({ success: false, message: "Game name is required." });
      return;
    }

    // Fetch game data from RAWG API
    const rawgGame = await searchRawgGame(name);

    if (!rawgGame && (!description || !image)) {
      res.status(404).json({
        success: false,
        message: `Game not found in RAWG API: ${name}. Please provide description and image manually.`,
      });
      return;
    }

    // Check if the game already exists in the database
    const existingGame = await Game.findOne({ name });
    if (existingGame) {
      res.status(200).json({
        success: true,
        message: "Game already exists in the database.",
        data: existingGame,
      });
      return;
    }

    // Save the game to the database
    const newGame = new Game({
      name: rawgGame?.name || name,
      description: rawgGame?.description || description,
      rating: rawgGame?.rating || rating || 0,
      image: rawgGame?.background_image || image,
      genres: rawgGame?.genres || [], // Add genres to the database
    });

    await newGame.save();

    res.status(201).json({
      success: true,
      message: "Game added to the database successfully.",
      data: newGame,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create the game. Please try again later.",
      error: (error as Error).message,
    });
  }
};

// Update an existing game
export const updateGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { gameID } = req.params;
  const { name, description, rating, image, genres } = req.body;

  try {
    if (!name || !description) {
      res.status(400).json({
        success: false,
        message: "Name and description are required.",
      });
      return;
    }

    const updatedGame = await Game.findByIdAndUpdate(
      gameID,
      { name, description, rating, image, genres },
      { new: true, runValidators: true }
    );

    if (!updatedGame) {
      res.status(404).json({ success: false, message: "Game not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Game updated successfully.",
      data: updatedGame,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update the game. Please try again later.",
      error: (error as Error).message,
    });
  }
};

// Delete a game
export const deleteGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { gameID } = req.params;

  try {
    const deletedGame = await Game.findByIdAndDelete(gameID);

    if (!deletedGame) {
      res.status(404).json({ success: false, message: "Game not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Game deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete the game. Please try again later.",
      error: (error as Error).message,
    });
  }
};
