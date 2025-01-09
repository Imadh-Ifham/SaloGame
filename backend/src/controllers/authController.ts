/**
 * controller functions that handle the logic for each authentication route. 
 */


import { Request, Response ,NextFunction } from 'express';
import admin from '../config/firebase';
import User, { IUser } from '../models/user.model';
import { generateToken } from '../utils/jwt';

export const handleEmailPasswordAuth = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Verify the Firebase ID token
    const userCredential = await admin.auth().getUserByEmail(email);
    
    // Check if user exists in our database
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user in our database
      user = new User({
        email,
        role: 'user',
        firebaseUid: userCredential.uid
      });
      await user.save();
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    console.error('Email/Password auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const handleGoogleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, uid } = decodedToken;
    
    if (!email) {
      throw new Error('No email found in Google authentication');
    }

    // Check if user exists in our database
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user in our database
      user = new User({
        email,
        role: 'user',
        firebaseUid: uid
      });
      await user.save();
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const verifySession = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ email: decodedToken.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(401).json({ message: 'Invalid session' });
  }
};

