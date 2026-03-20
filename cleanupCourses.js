import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Courses.js';

dotenv.config();

const cleanDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        // Remove unwanted courses
        const result = await Course.deleteMany({ 
            title: { 
                $in: [
                    "Next.js 14 Full Course",
                    "JavaScript Professional Level",
                    /Chai aur Code/i
                ] 
            }
        });

        console.log(`Deleted ${result.deletedCount} unwanted courses.`);

        // Also try regex-based cleanup for any Chai aur Code references
        const result2 = await Course.deleteMany({
            $or: [
                { title: { $regex: /Chai aur Code/i } },
                { description: { $regex: /Chai aur Code/i } },
                { description: { $regex: /Hitesh Choudhary/i } }
            ]
        });
        console.log(`Deleted ${result2.deletedCount} more courses (Chai aur Code / Hitesh related).`);

        // Update Software Testing course with 100 points if it exists
        const updateResult = await Course.findOneAndUpdate(
            { title: "Software Testing – Playwright, E2E, and AI Agents" },
            { points: 100 },
            { new: true }
        );
        if (updateResult) {
            console.log(`Updated "${updateResult.title}" with 100 points.`);
        }

        console.log("Cleanup completed!");
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Error cleaning DB:", error.message);
        process.exit(1);
    }
};

cleanDB();
