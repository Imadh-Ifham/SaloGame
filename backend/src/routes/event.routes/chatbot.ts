import express from 'express';
import { askQuestion } from '../../controllers/event.controller/chatbot.controller';

const router = express.Router();

// Chatbot route for handling questions
router.post('/ask', askQuestion);


export default router;