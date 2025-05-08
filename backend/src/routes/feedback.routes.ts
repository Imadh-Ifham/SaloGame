import express from 'express';
import { 
    createFeedback, 
    getFeedback,
    replyToFeedback,
    updateFeedbackStatus 
} from '../controllers/feedback.controller';
import { authMiddleware, managerOrOwner } from '../middleware/authMiddleware';
import fileUpload from 'express-fileupload';
import { RequestHandler } from 'express';

const router = express.Router();

router.get('/', authMiddleware, getFeedback as RequestHandler);

router.post('/', 
    authMiddleware,
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
        limits: { fileSize: 5 * 1024 * 1024 },
        abortOnLimit: true
    }),
    createFeedback as RequestHandler
);

router.post('/:feedbackId/reply', 
    authMiddleware, 
    managerOrOwner, 
    replyToFeedback as RequestHandler
);

router.patch('/:feedbackId/status', 
    authMiddleware, 
    managerOrOwner, 
    updateFeedbackStatus as RequestHandler
);

export default router;