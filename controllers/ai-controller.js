import Groq from "groq-sdk";
import dotenv from 'dotenv';
import Course from '../models/Courses.js';
dotenv.config();

export const getAIResponse = async (req, res) => {
    try {
        const { message, chatHistory } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Please provide a message" });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: "Groq API key is missing. Please add it to .env file." });
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
        - Respond ONLY in English. Do not use any other language.
        - For non-LMS or non-educational questions, politely steer back.`;

        const groq = new Groq({ apiKey });

        // Map history to Groq format (user/assistant)
        let messages = [
            { role: "system", content: systemPrompt }
        ];

        if (chatHistory && Array.isArray(chatHistory)) {
            chatHistory.forEach(item => {
                const role = item.role === 'model' ? 'assistant' : 'user';
                const content = item.parts && item.parts[0]?.text ? item.parts[0].text : "";
                if (content) {
                    messages.push({ role, content });
                }
            });
        }

        // Add current user message
        messages.push({ role: "user", content: message });

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
        res.json({ response: aiResponse });

    } catch (error) {
        console.error("Groq AI Error:", error);
        res.status(500).json({ 
            message: "AI service is currently unavailable.",
            details: error.message 
        });
    }
};
