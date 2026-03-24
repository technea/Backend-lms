import express from 'express';
import { getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/messages', protect, getMessages);
router.post('/send', protect, sendMessage);

export default router;
