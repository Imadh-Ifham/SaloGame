import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { verifyFirebaseToken } from '../utils/firebaseAuth';
import { AuthRequest } from './types';

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void>  => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
       res.status(401).json({ message: 'No token provided' });
    }
    const decoded = verifyToken(token as string);
    
    req.user = { id: 'userId', role: 'user' }; // Example user object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const firebaseAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
       res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = await verifyFirebaseToken(token as string);
    req.user = { id: 'userId', role: 'user' }; // Example user object
  next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid Firebase token' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

