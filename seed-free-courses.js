import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Courses.js';
import User from './models/User.js';

dotenv.config();

const seedFreeCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find an admin or instructor to be the "instructor" for these external courses
        const instructor = await User.findOne({ role: { $in: ['admin', 'instructor'] } });
        if (!instructor) {
            console.error('No instructor/admin found to assign courses to. Please create a user first.');
            process.exit(1);
        }

        const freeCourses = [
            {
                title: "CS50's Introduction to Computer Science",
                description: "An introduction to the intellectual enterprises of computer science and the art of programming from Harvard University.",
                category: "Technology",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://pll.harvard.edu/course/cs50-introduction-computer-science",
                source: "Harvard University",
                couponCode: "HARVARD-FREE",
                thumbnail: "💻"
            },
            {
                title: "Scientific Computing with Python",
                description: "Learn Python from the ground up with freeCodeCamp's comprehensive certification program.",
                category: "Data Science",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
                source: "freeCodeCamp",
                thumbnail: "🐍"
            },
            {
                title: "Responsive Web Design",
                description: "Master HTML and CSS to build modern, responsive websites with this freeCodeCamp path.",
                category: "Design",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
                source: "freeCodeCamp",
                thumbnail: "🎨"
            },
            {
                title: "Udemy: Web Development Bootcamp (Free Coupon)",
                description: "Limited time free coupon for the complete web development bootcamp. Master MERN stack.",
                category: "Technology",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
                source: "Udemy",
                couponCode: "NEXLEARN2026",
                thumbnail: "🚀"
            }
        ];

        await Course.deleteMany({ isExternal: true }); // Clear existing external courses
        await Course.insertMany(freeCourses);

        console.log('Successfully seeded free courses!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err.message);
        process.exit(1);
    }
};

seedFreeCourses();
