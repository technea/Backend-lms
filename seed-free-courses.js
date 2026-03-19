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
                title: "AI Foundations for Everyone Specialization",
                description: "Master the fundamentals of Artificial Intelligence with this comprehensive program from IBM.",
                category: "Technology",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.coursera.org/specializations/ai-foundations-for-everyone",
                source: "IBM",
                thumbnail: "🤖"
            },
            {
                title: "Python for Everybody Specialization",
                description: "This Specialization builds on the success of the Python for Everybody course and will introduce fundamental programming concepts.",
                category: "Technology",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.coursera.org/specializations/python",
                source: "University of Michigan",
                thumbnail: "🐍"
            },
            {
                title: "Machine Learning Specialization",
                description: "The Machine Learning Specialization is a foundational online program created in collaboration between DeepLearning.AI and Stanford Online.",
                category: "Data Science",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.coursera.org/specializations/machine-learning-introduction",
                source: "Stanford / DeepLearning.AI",
                thumbnail: "🧠"
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
                title: "Google AI Essentials",
                description: "Learn how to use AI in your everyday work life to be more productive and efficient.",
                category: "Technology",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.coursera.org/learn/google-ai-essentials",
                source: "Google",
                thumbnail: "💡"
            },
            {
                title: "Fundamentals of Social Media Advertising",
                description: "Learn how to establish a social media presence and create effective ad campaigns on Facebook and Instagram.",
                category: "Marketing",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.coursera.org/learn/social-media-advertising-fundamentals",
                source: "Meta",
                thumbnail: "📢"
            },
            {
                title: "Financial Markets",
                description: "An overview of the ideas, methods, and institutions that permit human society to manage risks and foster enterprise.",
                category: "Business",
                instructor: instructor._id,
                price: 0,
                isExternal: true,
                externalLink: "https://www.coursera.org/learn/financial-markets-global",
                source: "Yale University",
                thumbnail: "🏛️"
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
