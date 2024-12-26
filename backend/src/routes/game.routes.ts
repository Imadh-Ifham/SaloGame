import express, { Router } from "express";
import {
  createGame,
  deleteGame,
  getAllGames,
  getGameById,
  updateGame,
} from "../controllers/game.controller";

const router: Router = express.Router({ mergeParams: true });

router.get("/", getAllGames);
router.get("/:gameID", getGameById);
router.post("/create", createGame);
router.put("/update", updateGame);
router.delete("/delete", deleteGame);

export default router;
