import express from "express";
import {
  createMembership,
  getMembershipById,
  updateMembership,
  deleteMembership,
  getMemberships,
  toggleActiveMembership,
  getCurrentMembership,
} from "../controllers/membershipType.controller";
import { authMiddleware } from "../middleware/authMiddleware"; // Add this import

const router = express.Router();
// Define routes
router.get("/current", authMiddleware, getCurrentMembership);
router.post("/", createMembership);
router.get("/", getMemberships);
router.get("/:id", getMembershipById);
router.put("/:id", updateMembership);
router.delete("/:id", deleteMembership);
router.patch("/:id/toggle-active", toggleActiveMembership);

export default router;
