// server/src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';

const app = express();

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serve
app.use(express.static("public"));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// ============ HEALTH CHECK ============

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed health check (with DB and Redis status)
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis
    let redisStatus = 'disconnected';
    try {
      const redis = (await import('./config/redis.config.js')).default;
      const redisPing = await redis.ping();
      redisStatus = redisPing === 'PONG' ? 'connected' : 'disconnected';
    } catch (error) {
      redisStatus = 'disconnected';
    }

    res.status(200).json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// ============ ROUTES ============

// Import routes
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import projectRoutes from './routes/project.routes.js';
import proposalRoutes from './routes/proposal.routes.js';
import categoryRoutes from './routes/category.routes.js'; 
import skillRoutes from './routes/skill.routes.js'; 
import contractRoutes from './routes/contract.routes.js'; 
import reviewRoutes from './routes/review.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import messageRoutes from './routes/message.routes.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// ============ ERROR HANDLING ============

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