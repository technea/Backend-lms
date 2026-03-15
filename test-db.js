import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const userCount = await User.countDocuments();
        console.log(`Total users in database: ${userCount}`);
        
        const users = await User.find().limit(5).select('name email role');
        console.log('Sample Users:', users);
        
        process.exit(0);
    } catch (err) {
        console.error('DB Test Error:', err.message);
        process.exit(1);
    }
};

testDB();
