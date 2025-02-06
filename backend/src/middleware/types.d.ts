import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "user" | "manager" | "owner";
    email: string;
    firebaseUid: string;
  };
}
