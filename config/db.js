import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ Environment Error: MONGO_URI is missing. Please check your Vercel/local .env settings.");
            return;
        }
        console.log("Connecting to MongoDB...");
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        // DO NOT use process.exit(1) on Vercel as it crashes the entire deployment worker
        // Instead, we let the app stay up so later requests can re-attempt or throw normal errors
    }
};

export default connectDB;
