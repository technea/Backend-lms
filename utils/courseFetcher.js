import axios from 'axios';
import Course from '../models/Courses.js';
import User from '../models/User.js';

// This utility will fetch free courses from public aggregators
export const syncExternalCourses = async () => {
    try {
        console.log("🚀 Starting External Course Sync...");
        
        // Find or create a 'System' user as the instructor for external courses
        let systemUser = await User.findOne({ email: 'system@nexlearn.ai' });
        if (!systemUser) {
            systemUser = await User.create({
                name: 'NexLearn Bot',
                email: 'system@nexlearn.ai',
                password: 'system_secure_pass_123',
                role: 'admin',
                age: 25,
                isVerified: true
            });
        }

        // 1. Mock Fetch for Demonstration (Real implementation would use specific RSS/API)
        const externalSources = [
            {
                title: "CS50's Introduction to Computer Science",
                description: "The legendary Harvard course. Learn the foundations of computer science and programming.",
                category: "Computer Science",
                price: 0,
                isExternal: true,
                externalLink: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
                source: "Harvard / edX",
                thumbnail: "https://online-learning.harvard.edu/sites/default/files/styles/course_featured_image/public/course-images/CS50x.png"
            },
            {
                title: "JavaScript Algorithms and Data Structures",
                description: "Master JS basics to advanced data structures with this comprehensive fCC curriculum.",
                category: "Web Development",
                price: 0,
                isExternal: true,
                externalLink: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
                source: "freeCodeCamp",
                thumbnail: "https://www.freecodecamp.org/news/content/images/2022/02/javascript-algorithms-data-structures-main.png"
            },
            {
                title: "[FREE] Python for Data Science (Udemy)",
                description: "Limited time free coupon for Python Data Science bootcamp. Grab it now!",
                category: "Data Science",
                price: 0,
                isExternal: true,
                externalLink: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/?couponCode=FREE_MARCH",
                source: "Udemy",
                couponCode: "FREE_MARCH",
                thumbnail: "https://img-c.udemycdn.com/course/480x270/903744_e492.jpg"
            }
        ];

        for (const c of externalSources) {
            await Course.findOneAndUpdate(
                { externalLink: c.externalLink }, 
                { ...c, instructor: systemUser._id },
                { upsert: true, new: true }
            );
        }

        console.log("✅ External Courses Synced Successfully!");
    } catch (error) {
        console.error("❌ Sync Error:", error.message);
    }
};
