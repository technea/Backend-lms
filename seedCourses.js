import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Courses.js';
import User from './models/User.js';

dotenv.config();

const courses = [
  {
    title: "Software Testing – Playwright, E2E, and AI Agents",
    description: "Learn the essentials of software testing, from fundamental concepts like the testing pyramid to hands-on automation using Playwright. Explore real-world end-to-end testing, AI-driven testing agents, and best practices for building reliable software.",
    category: "Testing",
    price: 0,
    isYouTube: true,
    playlistUrl: "https://www.youtube.com/watch?v=jydYq7oAtD8",
    points: 100
  }
];

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error("Admin user not found. Run seedAdmin.js first.");
      process.exit(1);
    }

    for (const courseData of courses) {
      const existing = await Course.findOne({ title: courseData.title });
      if (!existing) {
        const newCourse = new Course({
          ...courseData,
          instructor: admin._id
        });
        await newCourse.save();
        console.log(`Added course: ${courseData.title}`);
      } else {
        // Update existing course with new data (like points)
        await Course.findOneAndUpdate({ title: courseData.title }, courseData);
        console.log(`Updated course: ${courseData.title}`);
      }
    }

    console.log("Seeding completed!");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding courses:", error.message);
    process.exit(1);
  }
};

seedCourses();
