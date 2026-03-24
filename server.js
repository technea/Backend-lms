import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect environment
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL || process.env.NODE_ENV === 'production';

// Route Imports
import userRoutes from './routes/user-routes.js';
import courseRoutes from './routes/course-routes.js';
import enrollmentRoutes from './routes/enrollment-routes.js';
import chatRoutes from './routes/chatRoutes.js';
import lessonRoutes from './routes/lesson-routes.js';
import adminRoutes from './routes/admin-routes.js';
import quizRoutes from './routes/quiz-routes.js';
// import aiRoutes from './routes/ai-routes.js';
import { protect } from './middleware/auth-middleware.js';
import { getMyEnrollments } from './controllers/enrollment-controller.js';
import { syncExternalCourses } from './utils/courseFetcher.js';
import chatSocket from './socket/chatSocket.js';
import Message from './models/Message.js'; // Model import for chat routes if needed


// Redundant config removed, moved to top

import { registerUser, loginUser, verifyOTP, resendOTP, walletLogin } from './controllers/user-controller.js';

// Initialize App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    },
    connectionStateRecovery: {} // From Socket.io v4 tutorial: enables state recovery
});


// Start Socket.io Chat logic
chatSocket(io);


// Connect to Database
connectDB().then(() => {
    // ONLY sync courses in local development, skip in Vercel to avoid performance penalties and cold start timeouts
    if (!IS_VERCEL) {
        console.log("🛠️ Syncing external courses (Local mode)...");
        syncExternalCourses();
    } else {
        console.log("☁️ Skipping course sync (Vercel mode)...");
    }
}).catch(err => {
    console.error("❌ Critical: DB Connection Failure during boot", err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

app.use('/uploads', express.static(IS_VERCEL ? os.tmpdir() : path.join(__dirname, 'uploads')));

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
app.post('/api/auth/wallet-login', walletLogin);

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
app.use('/api/chat', chatRoutes);

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

// ONLY call listen if NOT running on Vercel
// Vercel handles the server listening internally and might throw Errors if we try to bind a port
if (!IS_VERCEL) {
    server.listen(PORT, () => {
        console.log(`LMS Server with Socket.io active on port ${PORT}`);
    });
} else {
    console.log("🚀 Server initialized for Vercel environment.");
}


export default app;
