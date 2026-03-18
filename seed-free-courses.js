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
                title: "JavaScript Algorithms and Data Structures",
                description: "Master JavaScript with this certificate from freeCodeCamp covering basic to advanced algorithms.",
                category: "Technology",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/",
                source: "freeCodeCamp",
                thumbnail: "🧩"
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
                title: "Udemy: Complete Python Developer",
                description: "Master Python from zero to hero. Learn about the internals of the language and build applications.",
                category: "Technology",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.udemy.com/course/complete-python-developer-zero-to-mastery/",
                source: "Udemy",
                couponCode: "FREEPY2026",
                thumbnail: "🎓"
            },
            {
                title: "Google Data Analytics",
                description: "Kickstart your career in data analytics with this professional certificate from Google on Coursera.",
                category: "Data Science",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.coursera.org/professional-certificates/google-data-analytics",
                source: "Coursera",
                thumbnail: "📊"
            },
            {
                title: "Intro to Social Media Marketing",
                description: "Learn from Meta experts how to leverage social platforms to grow any business from scratch.",
                category: "Marketing",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.coursera.org/learn/social-media-marketing-introduction",
                source: "Meta",
                thumbnail: "📢"
            },
            {
                title: "Microsoft Azure Fundamentals",
                description: "Pass your AZ-900 exam with this full curated path from Microsoft Learn—completely free.",
                category: "Technology",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/",
                source: "Microsoft",
                thumbnail: "☁️"
            },
            {
                title: "Udemy: Graphic Design Masterclass",
                description: "Learn Photoshop, Illustrator, and InDesign by working on real-world creative projects.",
                category: "Design",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.udemy.com/course/graphic-design-masterclass/",
                source: "Udemy",
                couponCode: "ARTOFDESIGN",
                thumbnail: "🖋️"
            },
            {
                title: "Financial Planning for Young Adults",
                description: "Master your personal finances, budgeting, and investment strategies with this free course.",
                category: "Business",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.coursera.org/learn/financial-planning",
                source: "Coursera",
                thumbnail: "💰"
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
