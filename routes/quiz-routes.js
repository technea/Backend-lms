import express from 'express';
import { createQuiz, getQuizzes, deleteQuiz } from '../controllers/quiz-controller.js';
import { protect, restrictTo } from '../middleware/auth-middleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('instructor', 'admin'), createQuiz);
router.get('/', protect, getQuizzes);
router.delete('/:id', protect, restrictTo('instructor', 'admin'), deleteQuiz);

export default router;
