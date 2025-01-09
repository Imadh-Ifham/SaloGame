import express from 'express';
import { handleEmailPasswordAuth, handleGoogleAuth, verifySession } from '../controllers/authController';

const router = express.Router();

router.post('/email', handleEmailPasswordAuth);
router.post('/google', handleGoogleAuth);
router.post('/verify-session', verifySession);

export default router;

