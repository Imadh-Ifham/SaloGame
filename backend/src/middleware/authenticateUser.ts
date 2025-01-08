// src/middleware/authenticateUser.ts
import { Request, Response, NextFunction } from "express";
import { verifyFirebaseToken } from "../firebaseAdmin";

export interface AuthenticatedRequest extends Request {
  user?: { uid: string; email: string; role?: string };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return; // Ensure the function doesn't proceed further
  }

  const token = authHeader.split(" ")[1]; // Correctly split by space

  try {
    const decodedToken = await verifyFirebaseToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      role: (decodedToken as any).role || "user", // Assuming 'role' is set as a custom claim
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return; // Ensure the function doesn't proceed further
  }
};
