import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Courses.js';

dotenv.config();

const cleanDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const result = await Course.deleteMany({ 
            $or: [
                { title: { $regex: /Chai aur Code/i } },
                { description: { $regex: /Hitesh Choudhary/i } },
                { description: { $regex: /Chai aur Code/i } }
            ]
        });

        console.log(`Deleted ${result.deletedCount} courses related to 'Chai aur Code' or 'Hitesh Choudhary'.`);
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Error cleaning DB:", error.message);
        process.exit(1);
    }
};

cleanDB();
