import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Courses.js';
import Enrollment from './models/Enrollment.js';

dotenv.config();

const autoEnroll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        // 1. Find the target course
        const targetCourse = await Course.findOne({ 
            title: "Software Testing – Playwright, E2E, and AI Agents" 
        });

        if (!targetCourse) {
            console.error("Target course not found. Run seedCourses.js first.");
            process.exit(1);
        }

        console.log(`Found course: ${targetCourse.title} (${targetCourse._id})`);

        // 2. Find all students
        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students.`);

        // 3. Create enrollments for those not already enrolled
        let enrolledCount = 0;
        let skippedCount = 0;

        for (const student of students) {
            const existingEnrollment = await Enrollment.findOne({
                student: student._id,
                course: targetCourse._id
            });

            if (!existingEnrollment) {
                await Enrollment.create({
                    student: student._id,
                    course: targetCourse._id,
                    progress: 0
                });
                enrolledCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`Successfully enrolled ${enrolledCount} users.`);
        console.log(`Skipped ${skippedCount} users (already enrolled).`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Error during auto-enrollment:", error.message);
        process.exit(1);
    }
};

autoEnroll();
