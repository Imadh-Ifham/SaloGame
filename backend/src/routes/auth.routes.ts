/**
 * set up routes for handling email/password authentication, 
 * Google authentication,
 *  and session verification.
 */

import express, { Router } from 'express';
import { handleEmailPasswordAuth, handleGoogleAuth, verifySession } from '../controllers/authController';

const router: Router = express.Router();

// Fix the type mismatch by using RequestHandler type assertion
router.post('/email', handleEmailPasswordAuth as express.RequestHandler);
router.post('/google', handleGoogleAuth as express.RequestHandler); 
router.post('/verify-session', verifySession as express.RequestHandler);

export default router;