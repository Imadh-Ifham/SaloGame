import { Response } from 'express';
import { AuthRequest } from '../middleware/types';
import { Feedback } from '../models/feedback.model';

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { message, category } = req.body;
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const feedback = new Feedback({
      userId: req.user.id, // Changed from _id to id
      message,
      category
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

export const getFeedback = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const feedback = await Feedback.find({ userId: req.user.id }) // Changed from _id to id
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};