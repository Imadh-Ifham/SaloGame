import express from "express";
import {
  createMembership,
  getMembershipById,
  updateMembership,
  deleteMembership,
  getMemberships,
} from "../controllers/membershipType.controller";
const router = express.Router();
// Define routes
router.post("/", createMembership); // POST /api/memberships
router.get("/", getMemberships); // GET /api/memberships
router.get("/:id", getMembershipById); // GET /api/memberships/:id
router.put("/:id", updateMembership); // PUT /api/memberships/:id
router.delete("/:id", deleteMembership); // DELETE /api/memberships/:id

export default router;
