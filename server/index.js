// server/index.js
// Entry point of backend application

import dotenv from "dotenv";

// Load environment variables 
dotenv.config({
  path: "./.env",
});

// Import other modules
import connectDB from "./src/database/dbConnection.js";
import redis from "./src/config/redis.config.js";
import { app } from "./src/app.js";

const PORT = process.env.PORT;

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start Express server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running at: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // Exit process if MongoDB connection fails
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  });