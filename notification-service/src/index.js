const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const notificationRoutes = require('./routes/notification');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');
const { connectRedis } = require('./config/database');
const { NotificationService } = require('./services/notificationService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3006;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for notifications
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Routes
app.use('/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected to notification service', { socketId: socket.id });

  socket.on('authenticate', (data) => {
    NotificationService.authenticateSocket(socket, data);
  });

  socket.on('join-room', (data) => {
    NotificationService.joinRoom(socket, data);
  });

  socket.on('leave-room', (data) => {
    NotificationService.leaveRoom(socket, data);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected from notification service', { socketId: socket.id });
    NotificationService.handleDisconnect(socket);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    
    // Initialize notification service
    NotificationService.initialize(io);
    
    server.listen(PORT, () => {
      logger.info(`Notification service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
