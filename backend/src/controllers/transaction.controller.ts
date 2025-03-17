import { Response } from "express";
import { AuthRequest } from "../middleware/types";
import Transaction from "../models/transaction.model";
import User from "../models/user.model";

/**
 * Create a new transaction
 * If payment type is XP, it will deduct XP from the user's account
 * 
 * Validation rules:
 * 1. Walk-in-booking: payment type must be cash and user role must be owner or manager
 * 2. Membership: payment can be cash or card, but cash is only acceptable for manager or owner
 * 3. Online-booking: payment must be XP and user role must be user
 */
export const createTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { paymentType, amount, transactionType } = req.body;

    // Validation rule 1: For walk-in-booking
    if (transactionType === "walk-in-booking") {
      if (paymentType !== "cash") {
        res.status(400).json({ 
          error: "Payment type for walk-in-booking must be cash" 
        });
        return;
      }

      if (req.user.role !== "owner" && req.user.role !== "manager") {
        res.status(403).json({ 
          error: "Only owners and managers can create walk-in-booking transactions" 
        });
        return;
      }
    }

    // Validation rule 2: For membership
    if (transactionType === "membership") {
      if (paymentType !== "cash" && paymentType !== "card") {
        res.status(400).json({ 
          error: "Payment type for membership must be cash or card" 
        });
        return;
      }

      if (paymentType === "cash" && 
          req.user.role !== "owner" && 
          req.user.role !== "manager") {
        res.status(403).json({ 
          error: "Cash payment for membership is only allowed for owners and managers" 
        });
        return;
      }
    }

    // Validation rule 3: For online-booking
    if (transactionType === "online-booking") {
      if (paymentType !== "XP") {
        res.status(400).json({ 
          error: "Payment type for online-booking must be XP" 
        });
        return;
      }

      if (req.user.role !== "user") {
        res.status(403).json({ 
          error: "Only users can create online-booking transactions" 
        });
        return;
      }
    }

    // Create transaction object
    const transaction = new Transaction({
      userID: req.user.id,
      paymentType,
      amount,
      transactionType,
      status: "pending"
    });

    // If payment type is XP, deduct XP from user's account
    if (paymentType === "XP") {
      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (user.xp < amount) {
        res.status(400).json({ error: "Insufficient XP balance" });
        return;
      }

      // Deduct XP from user's account
      user.xp -= amount;
      await user.save();
    }

    // Mark transaction as completed
    transaction.status = "completed";
    await transaction.save();

    res.status(201).json({ 
      message: "Transaction created successfully", 
      transaction 
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all transactions for the current user
 */
export const getUserTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;
    
    // Parse date filters if provided
    const startDateStr = req.query.startDate as string;
    const endDateStr = req.query.endDate as string;
    
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
    
    console.log('User date filter params:', { 
      startDateStr, 
      endDateStr,
      parsedStartDate: startDate?.toISOString(),
      parsedEndDate: endDate?.toISOString()
    });
    
    // Build query conditions
    const query: any = { userID: req.user.id };
    
    // Add date range filters if provided
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate && !isNaN(startDate.getTime())) {
        query.createdAt.$gte = startDate;
      }
      
      if (endDate && !isNaN(endDate.getTime())) {
        query.createdAt.$lte = endDate;
      }
    }
    
    console.log('User MongoDB query:', JSON.stringify(query));
    
    // Get total count for pagination with applied filters
    const totalCount = await Transaction.countDocuments(query);
    
    // Fetch transactions with pagination, sorting by createdAt in descending order (newest first)
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const hasMore = skip + transactions.length < totalCount;
    
    res.status(200).json({
      transactions,
      totalCount,
      hasMore,
      page,
      limit
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all transactions (admin/owner only)
 */
export const getAllTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;
    
    // Parse date filters if provided
    const startDateStr = req.query.startDate as string;
    const endDateStr = req.query.endDate as string;
    
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
    
    console.log('Date filter params:', { 
      startDateStr, 
      endDateStr,
      parsedStartDate: startDate?.toISOString(),
      parsedEndDate: endDate?.toISOString()
    });
    
    // Build query conditions
    const query: any = {};
    
    // Add date range filters if provided
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate && !isNaN(startDate.getTime())) {
        query.createdAt.$gte = startDate;
      }
      
      if (endDate && !isNaN(endDate.getTime())) {
        query.createdAt.$lte = endDate;
      }
    }
    
    console.log('MongoDB query:', JSON.stringify(query));
    
    // Get total count for pagination with applied filters
    const totalCount = await Transaction.countDocuments(query);
    
    // Fetch transactions with pagination, sorting by createdAt in descending order (newest first)
    const transactions = await Transaction.find(query)
      .populate('userID', 'email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const hasMore = skip + transactions.length < totalCount;
    
    res.status(200).json({
      transactions,
      totalCount,
      hasMore,
      page,
      limit
    });
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a transaction (owner only)
 */
export const deleteTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { transactionId } = req.params;

    // Find and delete the transaction
    const transaction = await Transaction.findByIdAndDelete(transactionId);
    
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    // If this was an XP transaction, refund the XP to the user's account
    if (transaction.paymentType === "XP" && transaction.status === "completed") {
      const user = await User.findById(transaction.userID);
      if (user) {
        user.xp += transaction.amount;
        await user.save();
      }
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 