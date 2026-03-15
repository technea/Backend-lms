import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("Connecting to URI:", process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
        console.log(`Database Name Check: ${conn.connection.name}`);
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }
};

export default connectDB;
