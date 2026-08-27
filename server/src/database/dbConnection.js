// server/src/database/dbConnection.js
import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUrl = process.env.MONGODB_URL;

    if (!mongoUrl) {
        throw new Error("MONGODB_URL is not configured");
    }

    try {
        const connection = await mongoose.connect(mongoUrl);

        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error("MongoDB Error:", error.message);
        throw error;
    }
};

export default connectDB;