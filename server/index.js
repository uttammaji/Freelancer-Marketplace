// server/index.js
// Entry point of backend application

import dotenv from "dotenv";
import connectDB from "./src/database/dbConnection.js";
import { app } from "./src/app.js";

// Load environment variables from .env file
dotenv.config({
    path: "./.env"
});

// Connect to MongoDB
connectDB()
    .then(() => {
        // Start Express server after successful DB connection
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server running at: http://localhost:${process.env.PORT || 3000}`);
        });
    })
    .catch((error) => {
        // Exit process if MongoDB connection fails
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    });