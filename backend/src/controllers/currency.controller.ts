import { Request, Response } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../middleware/types";

// Add XP to a user
export const addXP = async (req: Request, res: Response): Promise<void> => {
  const { userId, amount } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if user has role "user"
    if (user.role !== "user") {
      res.status(403).json({ 
        error: "XP can only be added to users with role 'user'" 
      });
      return;
    }

    user.xp += amount;
    await user.save();
    res.status(200).json({ message: "XP added successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Deduct XP from a user
export const deductXP = async (req: Request, res: Response): Promise<void> => {
  const { userId, amount } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if user has role "user"
    if (user.role !== "user") {
      res.status(403).json({ 
        error: "XP can only be deducted from users with role 'user'" 
      });
      return;
    }

    if (user.xp < amount) {
      res.status(400).json({ error: "Insufficient XP balance" });
      return;
    }

    user.xp -= amount;
    await user.save();
    res.status(200).json({ message: "XP deducted successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's XP balance
export const getXPBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if user has role "user"
    if (user.role !== "user") {
      res.status(403).json({ 
        error: "Only users with role 'user' can check XP balance" 
      });
      return;
    }

    res.status(200).json({ xp: user.xp });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
