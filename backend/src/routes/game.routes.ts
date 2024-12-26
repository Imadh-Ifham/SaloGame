import express, { Router } from "express";
import { createGame, getAllGames } from "../controllers/game.controller";

const router: Router = express.Router({ mergeParams: true });

router.get("/", getAllGames);
router.post("/create-game", createGame);

export default router;
