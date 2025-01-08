// src/controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { AuthenticatedRequest } from "../middleware/authenticateUser";
import { body, validationResult } from "express-validator";

// Validation Middleware for Creating User
export const validateCreateUser = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  // Add more validations as needed
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ message: "Validation errors", errors: errors.array() });
      return;
    }
    next();
  },
];

// Create User
export const createUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { uid, email } = req.user!; // Firebase token user info
  const { name } = req.body; // Removed role from client input to prevent privilege escalation

  try {
    let user = await User.findOne({ firebaseUid: uid });
    if (user) {
      res.status(400).json({ message: "User already exists", user });
      return;
    }

    user = new User({ firebaseUid: uid, email, name });
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Get All Users (Admin Only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-__v"); // Exclude unnecessary fields
    res.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Update User Role (Admin Only)
export const updateUserRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    res.status(400).json({ message: "Invalid role specified" });
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User role updated successfully", user });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    res
      .status(500)
      .json({ message: "Error updating user role", error: error.message });
  }
};

// Delete User (Admin Only)
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User deleted successfully", user });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};
