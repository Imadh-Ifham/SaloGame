import express from "express";
import {
  getGamesForMachine,
  getMachinesForGame,
  assignGamesToMachine,
  removeGamesFromMachine,
  copyGamesToMachine,
} from "../controllers/machineGame.controller";

const router = express.Router();

router.get("/machine/:machineId/games", getGamesForMachine);
router.get("/game/:gameId/machines", getMachinesForGame);
router.post("/assign", assignGamesToMachine);
router.post("/remove", removeGamesFromMachine);
router.post("/copy", copyGamesToMachine);

export default router;
