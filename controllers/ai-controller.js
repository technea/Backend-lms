import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import Course from '../models/Courses.js';
dotenv.config();

export const getAIResponse = async (req, res) => {
    try {
        const { message, chatHistory } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Please provide a message" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "") {
            return res.status(500).json({ message: "Gemini API key is missing. Please add it to .env file." });
        }

        // Initialize Gemini inside the handler to ensure fresh environment
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Fetch current courses to give context to the AI
        let allCourses = [];
        try {
            allCourses = await Course.find({}, 'title category description price').limit(10);
        } catch (dbErr) {
            console.error("DB Context Error:", dbErr);
        }
        
        const courseContext = allCourses.map(c => `- ${c.title} (${c.category}): ${c.description.substring(0, 50)}... [Price: $${c.price}]`).join('\n');

        const systemInstruction = `You are the NexLearn AI Assistant. Your goal is to help users with questions specifically related to the NexLearn Learning Management System (LMS) and its courses.
                
        Available Courses:
        ${courseContext || "Check courses section for details."}

        Instructions:
        - Be professional and concise.
        - Use the course list to recommend relevant curriculum.
        - For non-LMS questions, politely decline and stay on topic.
        - Friendly and academic tone.`;

        // Sanitize Chat History: Gemini requires history to start with 'user'
        let sanitizedHistory = chatHistory || [];
        if (sanitizedHistory.length > 0 && sanitizedHistory[0].role === 'model') {
            sanitizedHistory = sanitizedHistory.slice(1);
        }

        // Start chat with sanitized history
        const chat = model.startChat({
            history: sanitizedHistory,
            generationConfig: {
                maxOutputTokens: 800,
                temperature: 0.7
            },
        });

        const finalMessage = `[CONTEXT: ${systemInstruction}]\n\nUser: ${message}`;
        const result = await chat.sendMessage(finalMessage);
        const text = result.response.text();

        res.json({ response: text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ 
            message: "AI is currently resting. Please check your API key and connection.",
            details: error.message 
        });
    }
};
