import express from "express";
import {
  addXP,
  calculatePrice,
  deductXP,
  getXPBalance,
} from "../controllers/currency.controller";
import { authMiddleware, managerOrOwner } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/calculate-price", calculatePrice);

router.use(authMiddleware);
router.get("/balance", getXPBalance);
router.post("/deduct", deductXP);

router.use(managerOrOwner);

router.post("/add", addXP);

export default router;
