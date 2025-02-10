import express from "express";
import {
  createSubscription,
  getUserSubscriptions,
  assignMembership,
  getExpiringSubscriptions,
  renewMultipleSubscriptions,
} from "../controllers/subscription.controller";
import { authMiddleware, managerOrOwner } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware); // Protect all subscription routes

router.post("/", createSubscription);
router.get("/user", getUserSubscriptions);
router.post("/assign", assignMembership);

router.get("/expiring", managerOrOwner, getExpiringSubscriptions);
router.post("/renew-multiple", managerOrOwner, renewMultipleSubscriptions);

export default router;
