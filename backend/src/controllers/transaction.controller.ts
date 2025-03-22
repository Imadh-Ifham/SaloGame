import { Request, Response } from "express";
import { AuthRequest } from "../middleware/types";
import Transaction from "../models/transaction.model";
import Last30DaysTransactions from "../models/last30DaysTransactions.model";
import User from "../models/user.model";
import { Server as SocketIOServer } from "socket.io";
import { deductXP } from "./currency.controller";

let io: SocketIOServer | null = null;

// Initialize Socket.IO instance
export const initializeSocketIO = (socketIO: SocketIOServer) => {
  io = socketIO;
};

/**
 * Create a new transaction
 * If payment type is XP, it will deduct XP from the user's account
 * 
 * Validation rules:
 * 1. Walk-in-booking: payment type can be cash or card (optional), status is pending, and user role must be owner or manager
 * 2. Membership: payment can be cash or card, but cash is only acceptable for manager or owner
 * 3. Online-booking: payment can be XP or card and user role must be user
 * 4. Refund: only admin/manager can create refunds, payment type must be cash or XP, amounts are automatically stored as negative
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

    // Check if payment type is required based on transaction type and user role
    const isPaymentTypeOptional = 
      transactionType === "walk-in-booking" && 
      (req.user.role === "owner" || req.user.role === "manager");
    
    // Validate payment type is provided when required
    if (!paymentType && !isPaymentTypeOptional) {
      res.status(400).json({ 
        error: "Payment type is required for this transaction" 
      });
      return;
    }

    // Validation rule 1: For walk-in-booking
    if (transactionType === "walk-in-booking") {
      if (paymentType && paymentType !== "cash" && paymentType !== "card") {
        res.status(400).json({ 
          error: "Payment type for walk-in-booking must be cash or card if specified" 
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

      if (paymentType === "cash" && req.user.role !== "owner" && req.user.role !== "manager") {
        res.status(403).json({ 
          error: "Only owners and managers can use cash payment for membership" 
        });
        return;
      }
    }

    // Validation rule 3: For online-booking
    if (transactionType === "online-booking") {
      if (paymentType !== "XP" && paymentType !== "card") {
        res.status(400).json({ 
          error: "Payment type for online-booking must be XP or card" 
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

    // Validation rule 4: For refund
    if (transactionType === "refund") {
      if (req.user.role !== "owner" && req.user.role !== "manager") {
        res.status(403).json({ 
          error: "Only owners and managers can create refund transactions" 
        });
        return;
      }

      // Ensure refund payment type is cash or XP
      if (paymentType !== "cash" && paymentType !== "XP") {
        res.status(400).json({ 
          error: "Refund payment type must be cash or XP" 
        });
        return;
      }
    }

    // Create transaction object
    const transaction = new Transaction({
      userID: req.user.id,
      paymentType,
      amount: transactionType === "refund" ? -Math.abs(amount) : amount, // Ensure refund amount is negative
      transactionType,
      status: "pending"
    });

    // If payment type is XP, deduct XP from user's account
    if (paymentType === "XP") {
      // Create mock request object for deductXP controller
      const deductXPReq = {
        body: {
          userId: req.user.id,
          amount: amount
        }
      };
      
      // Create mock response object with handlers
      const deductXPRes = {
        status: (code: number) => ({
          json: (data: any) => {
            if (code !== 200) {
              // If deductXP returns an error, propagate it to the transaction response
              res.status(code).json(data);
              return {
                end: () => {}
              };
            }
            return {
              end: () => {}
            };
          }
        })
      } as Response;
      
      // Call the deductXP controller directly
      console.log("Calling deductXP controller with request:", deductXPReq);
      await deductXP(deductXPReq as Request, deductXPRes);
      console.log("deductXP controller call completed");
    }

    // Mark transaction as completed unless it's a walk-in-booking
    if (transactionType !== "walk-in-booking") {
      transaction.status = "completed";
    }
    await transaction.save();

    // Update Last30DaysTransactions collection
    await updateLast30DaysTransactions(transaction);

    // Emit socket events for real-time updates
    if (io) {
      // Emit event for revenue updates (used by overview page)
      io.emit('transaction:new', { 
        transactionId: transaction._id,
        amount: transaction.amount,
        transactionType: transaction.transactionType 
      });
      
      // Emit detailed transaction data for TransactionList updates
      io.emit('transaction:created', {
        _id: transaction._id,
        userID: transaction.userID,
        paymentType: transaction.paymentType,
        amount: transaction.amount,
        transactionType: transaction.transactionType,
        status: transaction.status,
        createdAt: transaction.createdAt
      });
    }

    res.status(201).json({ 
      message: "Transaction created successfully", 
      transaction 
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper function to update the Last30DaysTransactions collection
const updateLast30DaysTransactions = async (transaction: any) => {
  try {
    // Get or create the last 30 days document
    const last30DaysDoc = await Last30DaysTransactions.findOne();
    
    if (!last30DaysDoc) {
      // Create a new document if it doesn't exist
      await Last30DaysTransactions.create({
        transactions: [{
          transactionId: transaction._id,
          userID: transaction.userID,
          paymentType: transaction.paymentType,
          amount: transaction.amount,
          transactionType: transaction.transactionType,
          status: transaction.status,
          createdAt: transaction.createdAt
        }],
        totalEarnings: transaction.status === "completed" ? transaction.amount : 0,
        lastUpdated: new Date()
      });
    } else {
      // Add the new transaction to the array
      last30DaysDoc.transactions.push({
        transactionId: transaction._id,
        userID: transaction.userID,
        paymentType: transaction.paymentType,
        amount: transaction.amount,
        transactionType: transaction.transactionType,
        status: transaction.status,
        createdAt: transaction.createdAt
      });
      
      // Remove transactions older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      last30DaysDoc.transactions = last30DaysDoc.transactions.filter(t => 
        new Date(t.createdAt) >= thirtyDaysAgo
      );
      
      // Recalculate total earnings
      last30DaysDoc.totalEarnings = last30DaysDoc.transactions
        .filter(t => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);
      
      last30DaysDoc.lastUpdated = new Date();
      
      await last30DaysDoc.save();
    }
  } catch (error) {
    console.error("Error updating Last30DaysTransactions:", error);
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

/**
 * Get Last 30 Days Earnings
 * Returns the total earnings from the last 30 days
 */
export const getLast30DaysEarnings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const last30DaysDoc = await Last30DaysTransactions.findOne();
    
    if (!last30DaysDoc) {
      // If no document exists, calculate from scratch
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const completedTransactions = await Transaction.find({
        status: "completed",
        createdAt: { $gte: thirtyDaysAgo }
      });
      
      const totalEarnings = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Create the document for future use
      await Last30DaysTransactions.create({
        transactions: completedTransactions.map(t => ({
          transactionId: t._id,
          userID: t.userID,
          paymentType: t.paymentType,
          amount: t.amount,
          transactionType: t.transactionType,
          status: t.status,
          createdAt: t.createdAt
        })),
        totalEarnings,
        lastUpdated: new Date()
      });
      
      res.status(200).json({
        success: true,
        totalEarnings,
        period: "Last 30 Days"
      });
    } else {
      // Check if we need to refresh the data
      const lastUpdated = new Date(last30DaysDoc.lastUpdated);
      const now = new Date();
      const hoursSinceLastUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      // If last update was more than 6 hours ago, refresh the data
      if (hoursSinceLastUpdate > 6) {
        await refreshLast30DaysTransactions();
        // Fetch the updated document
        const updatedDoc = await Last30DaysTransactions.findOne();
        res.status(200).json({
          success: true,
          totalEarnings: updatedDoc ? updatedDoc.totalEarnings : 0,
          period: "Last 30 Days"
        });
      } else {
        res.status(200).json({
          success: true,
          totalEarnings: last30DaysDoc.totalEarnings,
          period: "Last 30 Days"
        });
      }
    }
  } catch (error) {
    console.error("Error getting last 30 days earnings:", error);
    res.status(500).json({ error: "Failed to get earnings data" });
  }
};

// Function to refresh the Last30DaysTransactions collection
const refreshLast30DaysTransactions = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const completedTransactions = await Transaction.find({
      status: "completed",
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const totalEarnings = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    await Last30DaysTransactions.findOneAndUpdate(
      {}, // Find any document (there should be only one)
      {
        transactions: completedTransactions.map(t => ({
          transactionId: t._id,
          userID: t.userID,
          paymentType: t.paymentType,
          amount: t.amount,
          transactionType: t.transactionType,
          status: t.status,
          createdAt: t.createdAt
        })),
        totalEarnings,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error refreshing Last30DaysTransactions:", error);
  }
};

/**
 * Get the monthly revenue data for the last 6 months
 */
export const getMonthlyRevenue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    // Get the current date
    const currentDate = new Date();
    
    // Calculate the date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 5); // -5 to include current month
    sixMonthsAgo.setDate(1); // First day of the month
    sixMonthsAgo.setHours(0, 0, 0, 0); // Start of the day

    // Aggregate transactions by month
    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: "completed"
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$amount" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: {
                  if: { $lt: ["$_id.month", 10] },
                  then: { $concat: ["0", { $toString: "$_id.month" }] },
                  else: { $toString: "$_id.month" }
                }
              }
            ]
          },
          revenue: 1
        }
      }
    ]);

    // Fill in any missing months with zero revenue
    const result = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(sixMonthsAgo.getMonth() + i);
      
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existingData = monthlyRevenue.find(item => item.date === yearMonth);
      
      if (existingData) {
        result.push(existingData);
      } else {
        result.push({ date: yearMonth, revenue: 0 });
      }
    }

    // If socket is available, emit the monthly revenue data
    if (io) {
      io.emit('revenue:monthly', result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get transactions report data for specified time period
 */
export const getTransactionReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const period = req.query.period as '3mo' | '6mo' | '1yr';
    
    // Calculate date range based on period
    let endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '3mo':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6mo':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1yr':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        // Default to 3 months if invalid period
        startDate.setMonth(endDate.getMonth() - 3);
    }
    
    // Use custom date range if provided
    const customStartDate = req.query.startDate as string;
    const customEndDate = req.query.endDate as string;
    
    if (customStartDate && !isNaN(new Date(customStartDate).getTime())) {
      startDate = new Date(customStartDate);
    }
    
    if (customEndDate && !isNaN(new Date(customEndDate).getTime())) {
      endDate = new Date(customEndDate);
    }
    
    // Ensure startDate is beginning of day and endDate is end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    console.log('Report date range:', { startDate, endDate });
    
    // Build query for date range
    const query: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    // Fetch all transactions for the period (no pagination for reports)
    const transactions = await Transaction.find(query)
      .populate('userID', 'email name')
      .sort({ createdAt: -1 });
    
    // Calculate metrics
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const averageTransactionValue = totalRevenue / completedTransactions || 0;
    
    // Group transactions by type
    const transactionsByType = transactions.reduce((acc, t) => {
      const type = t.transactionType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group transactions by payment method (excluding undefined payment types)
    const transactionsByPayment = transactions.reduce((acc, t) => {
      if (t.paymentType) {
        acc[t.paymentType] = (acc[t.paymentType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Return the report data
    res.status(200).json({
      transactions,
      metrics: {
        totalTransactions,
        completedTransactions,
        totalRevenue,
        averageTransactionValue,
        transactionsByType,
        transactionsByPayment,
      },
      startDate,
      endDate,
    });
  } catch (error) {
    console.error("Error generating transaction report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a transaction by ID
 * Only allows updating paymentType and amount (optional) with proper validations
 * Security validations:
 * 1. Only pending walk-in-booking transactions can be updated
 * 2. Payment type must be cash or card
 * 3. Status is automatically set to completed
 */
export const updateTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { transactionId } = req.params;
    const { paymentType, amount } = req.body;

    // Find the transaction
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    // Only pending walk-in-booking transactions can be updated
    if (transaction.status !== "pending" || transaction.transactionType !== "walk-in-booking") {
      res.status(400).json({ 
        error: "Only pending walk-in-booking transactions can be updated" 
      });
      return;
    }

    // Validate payment type for walk-in-booking - must be cash or card only
    if (paymentType !== undefined) {
      if (paymentType !== "cash" && paymentType !== "card") {
        res.status(400).json({ 
          error: "Payment type for walk-in-booking must be cash or card" 
        });
        return;
      }
    }

    // Update the transaction
    const updates: { paymentType?: string; amount?: number; status: string } = {
      status: "completed" // Always set status to completed
    };
    
    if (paymentType !== undefined) {
      updates.paymentType = paymentType;
    }
    
    if (amount !== undefined) {
      updates.amount = amount;
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { $set: updates },
      { new: true }
    );

    if (!updatedTransaction) {
      res.status(500).json({ error: "Failed to update transaction" });
      return;
    }
    
    // Update Last30DaysTransactions collection
    await updateLast30DaysTransactions(updatedTransaction);

    // Emit socket events for real-time updates
    if (io) {
      io.emit('transaction:updated', {
        _id: updatedTransaction._id,
        userID: updatedTransaction.userID,
        paymentType: updatedTransaction.paymentType,
        amount: updatedTransaction.amount,
        transactionType: updatedTransaction.transactionType,
        status: updatedTransaction.status,
        createdAt: updatedTransaction.createdAt
      });
    }

    res.status(200).json({ 
      message: "Transaction updated successfully", 
      transaction: updatedTransaction 
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 