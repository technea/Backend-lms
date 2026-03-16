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

        // Fetch current courses to give context
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
        - Recommend relevant curriculum from the list.
        - For non-LMS or non-educational questions, politely steer back.`;

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Use a more widely accessible model if flash fails
        const primaryModel = "gemini-1.5-flash";
        const fallbackModel = "gemini-pro";

        // Sanitize history: Filter out any items without parts or invalid roles
        let history = chatHistory || [];
        
        // Gemini strictly requires alternating roles starting with USER
        // and it must not end with a MODEL message if you're about to send a USER message
        let cleanedHistory = [];
        let nextRole = 'user';

        for (const item of history) {
            if (item.role === nextRole && item.parts && item.parts[0]?.text) {
                cleanedHistory.push({
                    role: item.role,
                    parts: [{ text: item.parts[0].text }]
                });
                nextRole = nextRole === 'user' ? 'model' : 'user';
            }
        }

        // If history ended up starting with model, remove it
        if (cleanedHistory.length > 0 && cleanedHistory[0].role === 'model') {
            cleanedHistory.shift();
        }

        const runAI = async (modelName) => {
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                systemInstruction: modelName.includes('1.5') ? systemPrompt : undefined
            });

            const chat = model.startChat({
                history: cleanedHistory,
                generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
            });

            const prompt = modelName.includes('1.5') ? message : `[CONTEXT: ${systemPrompt}]\n\nUser: ${message}`;
            const result = await chat.sendMessage(prompt);
            return result.response.text();
        };

        try {
            const text = await runAI(primaryModel);
            return res.json({ response: text });
        } catch (err) {
            console.error(`Primary model (${primaryModel}) failed:`, err.message);
            // Fallback
            const text = await runAI(fallbackModel);
            return res.json({ response: text });
        }

    } catch (error) {
        console.error("AI Controller Critical Error:", error);
        res.status(500).json({ 
            message: "AI is currently resting. Please check your API key and connection.",
            details: error.message 
        });
    }
};
