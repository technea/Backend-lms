import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route Imports
import userRoutes from './routes/user-routes.js';
import courseRoutes from './routes/course-routes.js';
import enrollmentRoutes from './routes/enrollment-routes.js';
import lessonRoutes from './routes/lesson-routes.js';
import adminRoutes from './routes/admin-routes.js';
import quizRoutes from './routes/quiz-routes.js';
// import aiRoutes from './routes/ai-routes.js';
import { protect } from './middleware/auth-middleware.js';
import { getMyEnrollments } from './controllers/enrollment-controller.js';
import { syncExternalCourses } from './utils/courseFetcher.js';

// Load Environment Variables
dotenv.config();

import { registerUser, loginUser, verifyOTP, resendOTP } from './controllers/user-controller.js';

// Initialize App
const app = express();

// Connect to Database
connectDB().then(() => {
    // Initial sync of external courses
    syncExternalCourses();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL;
app.use('/uploads', express.static(isVercel ? os.tmpdir() : path.join(__dirname, 'uploads')));

// Root Route
app.get('/', (req, res) => {
    res.send('LMS Backend Server is running successfully!');
});

app.get('/api', (req, res) => {
    res.json({ message: 'LMS API is active and ready!' });
});

// Auth Routes (Direct to match frontend service)
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.post('/api/auth/verify-otp', verifyOTP);
app.post('/api/auth/resend-otp', resendOTP);

// Main Routes
console.log('Mounting /api/users routes...');
app.use('/api/users', userRoutes);
console.log('Mounting /api/courses routes...');
app.use('/api/courses', courseRoutes);
app.use('/api/enroll', enrollmentRoutes);
app.get('/api/my-courses', protect, getMyEnrollments);
app.use('/api/lessons', lessonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quizzes', quizRoutes);

// 404 Handler
app.use((req, res, next) => {
    console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Server Setup
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

export default app;
