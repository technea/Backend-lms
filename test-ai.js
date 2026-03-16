import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

async function testGeminiAPI() {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        console.log('❌ Error: GEMINI_API_KEY not found in .env file');
        return;
    }
    
    console.log('✅ API Key found:', API_KEY.substring(0, 10) + '...');
    
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                contents: [{
                    parts: [{ text: "Say 'Hello'!" }]
                }]
            }
        );
        console.log('✅ Success with v1 and gemini-1.5-flash!');
        console.log('Response:', response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.log('❌ API List Models Failed!');
        if (error.response) {
            console.log('Error Details:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error Message:', error.message);
        }
    }
}

testGeminiAPI();
