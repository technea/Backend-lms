import mongoose from 'mongoose';
import Course from './models/Courses.js';
import dotenv from 'dotenv';
dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Course.countDocuments();
        const firstCourse = await Course.findOne();
        console.log(`DB Count: ${count}`);
        console.log(`First Course: ${JSON.stringify(firstCourse, null, 2)}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
checkDB();
