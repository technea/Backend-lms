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

        // Fetch current courses to give context to the AI
        let allCourses = [];
        try {
            allCourses = await Course.find({}, 'title category description price').limit(15);
        } catch (dbErr) {
            console.error("DB Context Error:", dbErr);
        }
        
        const courseContext = allCourses.map(c => `- ${c.title} (${c.category}): ${c.description.substring(0, 100)}... [Price: $${c.price}]`).join('\n');

        const systemPrompt = `You are the NexLearn AI Assistant. Your goal is to help users with questions specifically related to the NexLearn Learning Management System (LMS) and its courses.
                
        Available Courses:
        ${courseContext || "Check courses section for details."}

        Instructions:
        - Be professional, helpful and concise.
        - Use the course list to recommend relevant curriculum.
        - For non-LMS or non-educational questions, politely decline and steer back to NexLearn.
        - Friendly and academic tone.`;

        // Initialize Gemini with system instructions (Native for 1.5 versions)
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try gemini-1.5-flash first, fallback to gemini-pro if not found
        let model;
        try {
            model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: systemPrompt 
            });
        } catch (e) {
            model = genAI.getGenerativeModel({ 
                model: "gemini-pro"
            });
        }

        // Sanitize Chat History: Gemini requires history to start with 'user'
        let sanitizedHistory = chatHistory || [];
        if (sanitizedHistory.length > 0 && sanitizedHistory[0].role === 'model') {
            sanitizedHistory = sanitizedHistory.slice(1);
        }

        // Start chat
        const chat = model.startChat({
            history: sanitizedHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7
            },
        });

        // If fallback model used, we might need to prepend context
        const finalMessage = model.model === "gemini-pro" 
            ? `[NexLearn Context: ${systemPrompt}]\n\nUser Question: ${message}`
            : message;

        const result = await chat.sendMessage(finalMessage);
        const text = result.response.text();

        res.json({ response: text });
    } catch (error) {
        console.error("AI Error:", error);
        
        // Final attempt with gemini-pro if error was a 404 on flash
        if (error.status === 404 || error.message.includes("404")) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const chat = model.startChat({ history: [] });
                const result = await chat.sendMessage(message);
                return res.json({ response: result.response.text() });
            } catch (innerErr) {
                console.error("Critical AI Fallback Error:", innerErr);
            }
        }

        res.status(500).json({ 
            message: "AI is currently resting. Please check your API key and connection.",
            details: error.message 
        });
    }
};
