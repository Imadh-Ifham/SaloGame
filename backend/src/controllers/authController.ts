/**
 * controller functions that handle the logic for each authentication route.
 */

import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";
import User, { IUser } from "../models/user.model";
import { generateToken } from "../utils/jwt";
import MembershipType from "../models/membershipType.model";

/*
  handles both signup and login based on the 
  isSignUp flag in the request body
 */
export const handleEmailPasswordAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, isSignUp } = req.body;

    if (isSignUp) {
      // For signup, create a new user in Firebase
      const userRecord = await admin.auth().createUser({
        email,
        password,
      });

      const basicMembership = await MembershipType.findOne({ name: "Basic" });
      if (!basicMembership) {
        res.status(500).json({ message: "Basic membership type not found" });
        return;
      }

      // Create MongoDB user without password
      const user = new User({
        email,

        role: "user",
        firebaseUid: userRecord.uid,
        defaultMembershipId: basicMembership._id,
      });
      await user.save();

      const token = generateToken(user);
      res.status(201).json({ user, token });
    } else {
      // For login, only verify with Firebase
      const userRecord = await admin.auth().getUserByEmail(email);
      const user = await User.findOne({ firebaseUid: userRecord.uid });

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      const token = generateToken(user);
      res.json({ user, token });
    }
  } catch (error) {
    console.error("Email/Password auth error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

export const handleGoogleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, uid } = decodedToken;

    if (!email) {
      return res.status(401).json({ message: "No email found in token" });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      const basicMembership = await MembershipType.findOne({ name: "Basic" });
      if (!basicMembership) {
        return res
          .status(500)
          .json({ message: "Basic membership type not found" });
      }

      user = new User({
        email,
        role: "user",
        firebaseUid: uid,
        defaultMembershipId: basicMembership._id,
      });
      await user.save();
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

export const verifySession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(401).json({ message: "Invalid session" });
  }
};
