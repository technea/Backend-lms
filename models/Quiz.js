import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true } // index of the option
    }],
    tag: { type: String, default: 'General' },
    difficulty: { type: String, default: 'Intermediate' }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
