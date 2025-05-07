import express from 'express';
import { recordVisit, getWeeklyVisits, getHourlyVisits } from '../controllers/visits.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Record a new visit
router.post('/record', recordVisit);

// Get weekly visits 
router.get('/weekly', getWeeklyVisits);

// Get hourly visits for today
router.get('/hourly', getHourlyVisits);

export default router;