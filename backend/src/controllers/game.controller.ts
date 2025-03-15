import { Request, Response } from "express";
import Game from "../models/game.model";
import { searchRawgGame } from "../services/rawgService";

// Get all games
export const getAllGames = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const genre = req.query.genre as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (genre && genre !== "all") {
      query.genres = { $in: [genre] };
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    // Get total count for pagination
    const total = await Game.countDocuments(query);

    // Fetch games with pagination and filtering
    const games = await Game.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 }); // Sort by rating in descending order

    res.status(200).json({
      success: true,
      data: games,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: skip + games.length < total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch games. Please try again later.",
      error: (error as Error).message,
    });
  }
};

// Get game by ID
export const fetchGameByID = async (
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

// Preview game details from RAWG
export const previewGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.body;

  try {
    if (!name) {
      res.status(400).json({ success: false, message: "Game name is required." });
      return;
    }

    // Check if the game already exists in the database
    const existingGame = await Game.findOne({ name });
    if (existingGame) {
      res.status(409).json({
        success: false,
        message: "Game already exists in the database.",
        data: existingGame,
      });
      return;
    }

    // Fetch game data from RAWG API
    const rawgGame = await searchRawgGame(name);

    if (!rawgGame) {
      res.status(404).json({
        success: false,
        message: `Game not found in RAWG API: ${name}`,
      });
      return;
    }

    // Return the preview data
    res.status(200).json({
      success: true,
      message: "Game details fetched successfully.",
      data: rawgGame,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch game details. Please try again later.",
      error: (error as Error).message,
    });
  }
};

// Create a new game
export const createGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, rating, image, genres } = req.body;

  try {
    if (!name || !description || !image) {
      res.status(400).json({
        success: false,
        message: "Name, description, and image are required.",
      });
      return;
    }

    // Check if the game already exists in the database
    const existingGame = await Game.findOne({ name });
    if (existingGame) {
      res.status(409).json({
        success: false,
        message: "Game already exists in the database.",
        data: existingGame,
      });
      return;
    }

    // Save the game to the database
    const newGame = new Game({
      name,
      description,
      rating: rating || 0,
      image,
      genres: genres || [],
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
