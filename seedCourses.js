import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Courses.js';
import User from './models/User.js';

dotenv.config();

const courses = [
  {
    title: "ReactJS Mastery (Chai aur Code)",
    description: "A comprehensive guide to ReactJS by Hitesh Choudhary. Learn Hooks, State Management, and building production-ready apps.",
    category: "Frontend",
    price: 0,
    isYouTube: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsLzPIT33is_y7"
  },
  {
    title: "Backend Development with Node.js",
    description: "Master Node.js and Express with Hitesh Choudhary. Deep dive into APIs, Middlewares, and Database integration.",
    category: "Backend",
    price: 0,
    isYouTube: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBsMugTFALhcVz378-29N0B"
  },
  {
    title: "Next.js 14 Full Course",
    description: "Learn Next.js 14 from Piyush Garg. Covering App Router, Server Actions, and SEO optimization for modern web apps.",
    category: "Fullstack",
    price: 0,
    isYouTube: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLinedj3B30sDby4Al-i13hQJGQoRQDf69"
  },
  {
    title: "JavaScript Professional Level",
    description: "Go from zero to hero in JavaScript with Chai aur Code series. Understand closures, prototypes, and async JS deeply.",
    category: "Programming",
    price: 0,
    isYouTube: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tQU7QXE"
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
