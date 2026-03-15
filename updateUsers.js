import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const updateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Set isVerified: true for all existing users
        const result = await User.updateMany(
            { isVerified: { $exists: false } },
            { $set: { isVerified: true } }
        );

        console.log(`${result.modifiedCount} users updated to verified status.`);
        
        // Also update users where isVerified is false but they were created before today
        // (Just to be safe for all existing testing accounts)
        const result2 = await User.updateMany(
            { isVerified: false },
            { $set: { isVerified: true } }
        );
        console.log(`${result2.modifiedCount} more users updated to verified status.`);

        process.exit(0);
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
};

updateUsers();
