import express from "express";
import {
  createMembership,
  getMembershipById,
  updateMembership,
  getMemberships,
  deprecateMembershipPlan,
} from "../controllers/membershipType.controller";

const router = express.Router();

// Define routes
router.post("/", createMembership);
router.get("/", getMemberships);
router.get("/:id", getMembershipById);
router.put("/:id", updateMembership);
router.patch("/:id/deprecate", deprecateMembershipPlan);

export default router;
