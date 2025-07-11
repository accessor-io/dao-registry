const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes and middleware
const daoRoutes = require('./routes/dao');
const proposalRoutes = require('./routes/proposal');
const memberRoutes = require('./routes/member');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const { authenticateToken } = require('./middleware/auth');

// Import database connection
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');

// Import blockchain services
const { initializeBlockchainServices } = require('./services/blockchain');

// Import background jobs
const { initializeJobs } = require('./jobs');

// Import logger
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/daos', authenticateToken, daoRoutes);
app.use('/api/v1/proposals', authenticateToken, proposalRoutes);
app.use('/api/v1/members', authenticateToken, memberRoutes);
app.use('/api/v1/analytics', authenticateToken, analyticsRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join DAO room for real-time updates
  socket.on('join-dao', (daoId) => {
    socket.join(`dao-${daoId}`);
    logger.info(`Client ${socket.id} joined DAO ${daoId}`);
  });

  // Leave DAO room
  socket.on('leave-dao', (daoId) => {
    socket.leave(`dao-${daoId}`);
    logger.info(`Client ${socket.id} left DAO ${daoId}`);
  });

  // Handle proposal updates
  socket.on('proposal-update', (data) => {
    socket.to(`dao-${data.daoId}`).emit('proposal-updated', data);
  });

  // Handle vote updates
  socket.on('vote-update', (data) => {
    socket.to(`dao-${data.daoId}`).emit('vote-updated', data);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Initialize application
async function initializeApp() {
  try {
    // Connect to database
    await connectDB();
    logger.info('Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Initialize blockchain services
    await initializeBlockchainServices();
    logger.info('Blockchain services initialized');

    // Initialize background jobs
    await initializeJobs();
    logger.info('Background jobs initialized');

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start the application
initializeApp();

module.exports = { app, server, io }; 