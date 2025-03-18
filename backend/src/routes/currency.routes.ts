import express from "express";
import {
  addXP,
  deductXP,
  getXPBalance,
} from "../controllers/currency.controller";
import { authMiddleware, managerOrOwner } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);
router.get("/balance", getXPBalance);

router.use(managerOrOwner);

router.post("/add", addXP);
router.post("/deduct", deductXP);

export default router;
