import express from "express";
import {
  createSubscription,
  getUserSubscriptions,
  assignMembership,
  getUserExpiringNotifications,
} from "../controllers/subscription.controller";
import { authMiddleware, managerOrOwner } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware); // Protect all subscription routes

router.post("/", createSubscription);
router.get("/user", getUserSubscriptions);
router.post("/assign", assignMembership);
router.get("/my-expiring", getUserExpiringNotifications);
export default router;
