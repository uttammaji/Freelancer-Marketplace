// server/src/database/dbConnection.js
import mongoose from "mongoose";

/**
 * Connect to MongoDB database
 * Uses MONGODB_URL from environment variables
 * Exits process if connection fails
 */
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using connection string from .env
        const connectInstance = await mongoose.connect(
            `${process.env.MONGODB_URL}`
        );

        // Log success with host name
        console.log(
            `MongoDB Connected: ${connectInstance.connection.host}`
        );
    } catch (error) {
        // Log error and exit process if connection fails
        console.error("MongoDB Error:", error);
        process.exit(1);
    }
};

export default connectDB;