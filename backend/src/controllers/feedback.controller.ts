import { Response } from 'express';
import { AuthRequest } from '../middleware/types';
import { Feedback } from '../models/feedback.model';

// Fixed the return type to be void
export const createFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, message, rating, category, isAnonymous, email } = req.body;
    
    // Validate required fields
    if (!type || !message || !category) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: type, message, and category are required'
      });
      return; // Add return statement to exit function
    }

    // Validate type
    if (!['feedback', 'suggestion'].includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid feedback type'
      });
      return; // Add return statement
    }

    // Validate category
    if (!['general', 'service', 'facility', 'games', 'events'].includes(category)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
      return; // Add return statement
    }

    // Validate rating if type is feedback
    if (type === 'feedback' && (rating < 1 || rating > 5)) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
      return; // Add return statement
    }

    const feedback = new Feedback({
      type,
      message,
      rating: type === 'feedback' ? rating : undefined,
      category,
      isAnonymous: isAnonymous || false,
      email: isAnonymous ? undefined : email,
      user: isAnonymous ? undefined : req.user?.id,
      status: 'pending'
    });

    await feedback.save();
    
    // Emit socket event for real-time updates
    global.io?.emit('newFeedback', feedback);

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feedback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Fixed the return type to be void
export const getFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Use lean() for better performance when you don't need Mongoose documents
    const feedback = await Feedback.find()
      .populate('user', 'name email googlePhotoUrl')
      .populate('replies.repliedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    if (!feedback) {
      res.status(404).json({
        success: false,
        message: 'No feedback found'
      });
      return; // Add return statement
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const replyToFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!message?.trim()) {
      res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
      return;
    }

    const feedback = await Feedback.findById(feedbackId);
    
    if (!feedback) {
      res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
      return;
    }

    const reply = {
      message,
      repliedBy: userId,
      createdAt: new Date()
    };

    feedback.replies = feedback.replies || [];
    feedback.replies.push(reply);
    feedback.status = 'reviewed';
    
    await feedback.save();

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error replying to feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateFeedbackStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
      return;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true }
    );

    if (!feedback) {
      res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};