// src/middleware/authorizeRole.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticateUser";

export const authorizeRole = (requiredRole: "admin" | "user") => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized: No user information" });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      return;
    }

    next();
  };
};
