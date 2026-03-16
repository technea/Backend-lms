import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Courses.js';
import connectDB from './config/db.js';

dotenv.config();

const deleteInternalCourses = async () => {
    try {
        await connectDB();
        
        // Delete courses that are NOT external
        const result = await Course.deleteMany({ 
            $or: [
                { isExternal: false },
                { isExternal: { $exists: false } }
            ]
        });
        
        console.log(`✅ Successfully deleted ${result.deletedCount} internal courses.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error deleting courses:", error.message);
        process.exit(1);
    }
};

deleteInternalCourses();
