import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createFeedback,
  getFeedback,
  replyToFeedback,
  updateFeedbackStatus
} from '../controllers/feedback.controller';

const router = express.Router();

// Public route for creating feedback
router.post('/', createFeedback);

// Get all feedback - requires authentication
router.get('/', authMiddleware, getFeedback);

// Reply to feedback - requires authentication
router.post('/:feedbackId/reply', authMiddleware, replyToFeedback);

// Update feedback status - requires authentication
router.patch('/:feedbackId/status', authMiddleware, updateFeedbackStatus);

export default router;