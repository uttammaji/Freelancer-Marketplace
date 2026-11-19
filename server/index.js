// server/index.js
// Entry point of backend application

import dotenv from "dotenv";
import http from 'http';

// Load environment variables first
dotenv.config({
  path: "./.env",
});

// Import other modules
import connectDB from "./src/database/dbConnection.js";
import redis from "./src/config/redis.config.js";
import { app } from "./src/app.js";
import { initializeSocket } from "./src/sockets/socket.js";

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with server
initializeSocket(server);

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start server after successful DB connection
    server.listen(PORT, () => {
      console.log(`Server running at: http://localhost:${PORT}`);
      console.log(`Socket.IO running at: ws://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // Exit process if MongoDB connection fails
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  });