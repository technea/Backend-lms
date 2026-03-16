import dotenv from 'dotenv';
import Groq from 'groq-sdk';
dotenv.config();

async function testGroqAPI() {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        console.log('❌ Error: GROQ_API_KEY not found in .env file');
        return;
    }
    
    console.log('✅ Groq Key found:', apiKey.substring(0, 10) + '...');
    
    try {
        const groq = new Groq({ apiKey });
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Groq is working!'" }],
            model: "llama-3.3-70b-versatile",
        });
        
        console.log('✅ Groq API Test Successful!');
        console.log('🤖 Response:', chatCompletion.choices[0].message.content);
    } catch (error) {
        console.log('❌ Groq API Test Failed!');
        console.log('Error Details:', error.message);
    }
}

testGroqAPI();
