import express from "express";
import {
  createSubscription,
  getUserSubscriptions,
} from "../controllers/subscription.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware); // Protect all subscription routes

router.post("/", createSubscription);
router.get("/user", getUserSubscriptions);

export default router;
