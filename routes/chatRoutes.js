import express from 'express';
import { getMessages, sendMessage, deleteMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

router.get('/messages', protect, getMessages);
router.post('/send', protect, sendMessage);
router.delete('/messages/:id', protect, deleteMessage);

export default router;
