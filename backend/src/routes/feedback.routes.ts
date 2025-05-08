import express from 'express';
import { createFeedback, getFeedback } from '../controllers/feedback.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createFeedback);
router.get('/', authMiddleware, getFeedback);

export default router;