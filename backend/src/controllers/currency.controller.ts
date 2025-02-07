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

// Get user XP balance
export const getXPBalance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ xp: user.xp });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
