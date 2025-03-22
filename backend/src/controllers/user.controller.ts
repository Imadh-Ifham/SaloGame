import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { generateToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/types";
import { verifyFirebaseToken } from "../utils/firebaseAuth";
import admin from "../config/firebase";
// Handle user login/registration through Firebase
export const handleFirebaseAuth = async (req: Request, res: Response) => {
  try {
    const { firebaseUser, token: firebaseToken } = req.body;

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(firebaseToken);

    // Verify token matches user
    if (decodedToken.uid !== firebaseUser.uid) {
      res.status(401).json({
        success: false,
        message: "Token verification failed",
      });
      return;
    }

    // Check if user exists in MongoDB
    let user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email: firebaseUser.email,
        firebaseUid: firebaseUser.uid,
        role: "user", // Default role
      });
      try {
        await user.save();
        console.log("New user created in MongoDB:", user);
      } catch (saveError) {
        console.error("Error saving user to MongoDB:", saveError);
        throw saveError;
      }
    } else {
      console.log("Existing user found in MongoDB:", user);
    }

    // Generate JWT token
    const jwtToken = generateToken(user);

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create manager (owner only)
export const createManager = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, firebaseUid } = req.body;

    // Validate input
    if (!email || !firebaseUid) {
      res.status(400).json({
        message: "Email and firebaseUid are required",
      });
      return;
    }

    // Check if user is owner
    if (!req.user || req.user.role !== "owner") {
      res.status(403).json({ message: "Only owners can create managers" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const newManager = new User({
      email,
      firebaseUid,
      role: "manager",
    });
    await newManager.save();

    res
      .status(201)
      .json({ message: "Manager created successfully", user: newManager });
  } catch (error) {
    console.error("Error creating manager:", error);
    res.status(500).json({
      message: "Error creating manager",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all users (manager/owner only)
export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !["manager", "owner"].includes(req.user.role)) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const users = await User.find()
      .select("-password")
      .populate({
        path: "defaultMembershipId",
        select: "name _id",
      })
      .populate({
        path: "subscription", // Add this to populate subscription data
        select:
          "_id startDate endDate status totalAmount duration autoRenew paymentStatus",
      })
      .select("email name defaultMembershipId subscription")
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Error fetching users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update user (owner only for role updates)
export const updateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only owners can update roles
    if (updates.role && (!req.user || req.user.role !== "owner")) {
      res.status(403).json({ message: "Only owners can update user roles" });
      return;
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

// Delete user from both MongoDB and Firebase
export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Find user first to get Firebase UID
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Delete from Firebase first
    await admin.auth().deleteUser(user.firebaseUid);

    // Then delete from MongoDB
    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get user profile
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get user from JWT token
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user.id)
      .populate("defaultMembershipId")
      .select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

export const handleAdminAuth = async (req: Request, res: Response) => {
  try {
    const { firebaseUser, token } = req.body;

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.uid !== firebaseUser.uid) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    // Find user and verify role
    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user || !["manager", "owner"].includes(user.role)) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    const jwtToken = generateToken(user);
    res.json({ user, token: jwtToken });
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
};
// Create initial owner
export const createInitialOwner = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, firebaseUid } = req.body;

    // Validate input
    if (!email || !firebaseUid) {
      res.status(400).json({
        message: "Email and firebaseUid are required",
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const newOwner = new User({
      email,
      firebaseUid,
      role: "owner",
    });
    await newOwner.save();

    res
      .status(201)
      .json({ message: "Owner created successfully", user: newOwner });
  } catch (error) {
    console.error("Error creating Owner:", error);
    res.status(500).json({
      message: "Error creating Owner",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
