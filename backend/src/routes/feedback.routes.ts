import express from 'express';
import { 
  createFeedback, 
  getFeedback,
  replyToFeedback,
  updateFeedbackStatus
} from '../controllers/feedback.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (with auth)
router.post('/', authMiddleware, createFeedback);
router.get('/', authMiddleware, getFeedback);

// Admin/Manager routes
router.post('/:feedbackId/reply', authMiddleware, async (req, res) => {
  await replyToFeedback(req, res);
});

router.patch('/:feedbackId/status', authMiddleware, async (req, res) => {
  await updateFeedbackStatus(req, res);
});

export default router;