import express from "express";
import { authMiddleware, ownerOnly, managerOrOwner } from "../middleware/authMiddleware";
import { AuthRequest } from "../middleware/types";
import {
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  deleteTransaction
} from "../controllers/transaction.controller";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new transaction
router.post("/", createTransaction);

// Get user's transactions
router.get("/my-transactions", getUserTransactions);

// Get all transactions (requires owner or manager role)
router.get("/", managerOrOwner, getAllTransactions);

// Delete a transaction (requires owner role)
router.delete("/:transactionId", ownerOnly, deleteTransaction);

export default router; 