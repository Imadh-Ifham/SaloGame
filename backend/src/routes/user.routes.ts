// src/routes/userRoutes.ts
import express from "express";
import {
  createUser,
  getUsers,
  updateUserRole,
  deleteUser,
  validateCreateUser,
} from "../controllers/user.controller";
import { authenticateUser } from "../middleware/authenticateUser";
import { authorizeRole } from "../middleware/authorizeRole";

const router = express.Router();

// Public Route: Create User (Called after Firebase authentication)
router.post("/create", authenticateUser, validateCreateUser, createUser);

// Protected Route: Get All Users (Admin Only)
router.get("/", authenticateUser, authorizeRole("admin"), getUsers);

// Protected Route: Update User Role (Admin Only)
router.put(
  "/:userId/role",
  authenticateUser,
  authorizeRole("admin"),
  updateUserRole
);

// Protected Route: Delete User (Admin Only)
router.delete("/:userId", authenticateUser, authorizeRole("admin"), deleteUser);

export default router;
