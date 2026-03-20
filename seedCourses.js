import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Courses.js';
import User from './models/User.js';

dotenv.config();

const courses = [
  {
    title: "Next.js 14 Full Course",
    description: "Learn Next.js 14 from Piyush Garg. Covering App Router, Server Actions, and SEO optimization for modern web apps.",
    category: "Fullstack",
    price: 0,
    isYouTube: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLinedj3B30sDby4Al-i13hQJGQoRQDf69"
  },
  {
    title: "Mastering Tailwind CSS",
    description: "Build beautiful, responsive designs with Tailwind CSS. Learn class-based styling, responsive layouts, and dark mode implementation.",
    category: "Design",
    price: 0,
    isYouTube: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsLzPIT33is_y7"
  },
  {
    title: "Software Testing – Playwright, E2E, and AI Agents",
    description: "Master software testing using modern tools like Playwright. Learn E2E testing, automation, and the role of AI agents in testing.",
    category: "Testing",
    price: 0,
    isYouTube: true,
    playlistUrl: "https://www.youtube.com/watch?v=jydYq7oAtD8"
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
        console.log(`Course exists: ${courseData.title}`);
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
