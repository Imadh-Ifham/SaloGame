import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { verifyFirebaseToken } from "../utils/firebaseAuth";
import { AuthRequest } from "./types";
import User from "../models/user.model";

/**
 * Main authentication middleware.
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(token);

    // Get user from database
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Set user info in request
    req.user = {
      id: user._id as string,
      role: user.role,
      email: user.email,
      firebaseUid: user.firebaseUid,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Role-based authorization middleware
export const authorize = (allowedRoles: ("user" | "manager" | "owner")[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    next();
  };
};

// Owner-only middleware
export const ownerOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "owner") {
    res.status(403).json({ message: "Owner access required" });
    return;
  }
  next();
};

// Manager or owner middleware
export const managerOrOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !["manager", "owner"].includes(req.user.role)) {
    res.status(403).json({ message: "Manager or owner access required" });
    return;
  }
  next();
};
