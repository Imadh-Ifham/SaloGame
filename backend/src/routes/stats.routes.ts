import express from 'express';
import { getUserStats } from '../controllers/userStats.controller';
import { authMiddleware, managerOrOwner } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication and role check middleware
router.use(authMiddleware);
router.use(managerOrOwner);

// Get user statistics (requires manager or owner role)
router.get('/', getUserStats);

export default router;