import express from "express";
import {
  createMembership,
  getMembershipById,
  updateMembership,
  deleteMembership,
  getMemberships,
  toggleActiveMembership,
} from "../controllers/membershipType.controller";

const router = express.Router();
// Define routes
router.post("/", createMembership);
router.get("/", getMemberships);
router.get("/:id", getMembershipById);
router.put("/:id", updateMembership);
router.delete("/:id", deleteMembership);
router.patch("/:id/toggle-active", toggleActiveMembership);

export default router;
