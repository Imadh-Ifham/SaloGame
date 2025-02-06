import express, { Router } from "express";
import {
  createManager,
  handleFirebaseAuth,
  getUsers,
  updateUser,
  deleteUser,
  getProfile,
  handleAdminAuth,
  createInitialOwner,
} from "../controllers/user.controller";
import {
  authMiddleware,
  ownerOnly,
  managerOrOwner,
} from "../middleware/authMiddleware";

const router: Router = express.Router();
// Public routes
router.post("/auth/firebase", handleFirebaseAuth);

// Protected routes
router.use(authMiddleware);
router.get("/profile", getProfile);

// Manager/Owner routes
router.use(managerOrOwner);
router.get("/", getUsers);
router.put("/:id", updateUser);

// Owner only routes
router.post("/managers", ownerOnly, createManager);
router.delete("/:id", ownerOnly, deleteUser);

// Create owner (Testing environment)
router.post("/testOwner", createInitialOwner);
export default router;
