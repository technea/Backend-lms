import Quiz from '../models/Quiz.js';

export const createQuiz = async (req, res) => {
    try {
        const { title, description, courseId, questions, tag, difficulty } = req.body;
        const quiz = new Quiz({
            title,
            description,
            courseId: courseId || null,
            instructor: req.user._id,
            questions: typeof questions === 'string' ? JSON.parse(questions || '[]') : (questions || []),
            tag,
            difficulty
        });
        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Error creating quiz', error: error.message });
    }
};

export const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('instructor', 'name').populate('courseId', 'title');
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        if (quiz.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }
        
        await quiz.deleteOne();
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting quiz', error: error.message });
    }
};
