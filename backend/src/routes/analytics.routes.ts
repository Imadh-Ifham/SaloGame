import express from 'express';
import { getAnalyticsSummary } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.get('/summary', getAnalyticsSummary);


export default router;