// server/src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serve
app.use(express.static("public"));

// Import routes
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import projectRoutes from './routes/project.routes.js';
import proposalRoutes from './routes/proposal.routes.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);

// Import error handler
import { errorHandler } from './middleware/error.middleware.js';

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

export { app };