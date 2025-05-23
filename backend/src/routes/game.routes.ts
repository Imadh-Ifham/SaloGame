import express, { Router } from "express";
import {
  createGame,
  deleteGame,
  getAllGames,
  fetchGameByID,
  updateGame,
  previewGame,
} from "../controllers/game.controller";

const router: Router = express.Router();

// GET all games
router.get("/", getAllGames);

// GET a single game by ID
router.get("/:gameID", fetchGameByID);

// Preview game details from RAWG
router.post("/preview", previewGame);

// CREATE a new game
router.post("/", createGame);

// UPDATE an existing game by ID
router.put("/:gameID", updateGame);

// DELETE a game by ID
router.delete("/:gameID", deleteGame);

export default router;
