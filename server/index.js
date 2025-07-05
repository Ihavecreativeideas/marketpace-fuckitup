const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const marketplaceRoutes = require('./routes/marketplace');
const driverRoutes = require('./routes/driver');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import database
const { connectDB } = require('./config/database');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8000;

// Connect to database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MarketPace API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Community routes
app.use('/api/community', require('./routes/community'));

// Order routes
app.use('/api/orders', require('./routes/orders'));

// User routes
app.use('/api/user', authMiddleware, require('./routes/user'));

// Notification routes
app.use('/api/notifications', authMiddleware, require('./routes/notifications'));

// File upload routes
app.use('/api/uploads', authMiddleware, require('./routes/uploads'));

// Search routes
app.use('/api/search', require('./routes/search'));

// Analytics routes
app.use('/api/analytics', authMiddleware, require('./routes/analytics'));

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined personal room`);
  });

  // Join driver to driver room for route updates
  socket.on('join_driver_room', (driverId) => {
    socket.join(`driver_${driverId}`);
    socket.join('drivers'); // Global drivers room
    console.log(`Driver ${driverId} joined driver rooms`);
  });

  // Handle order tracking
  socket.on('track_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`User joined order tracking room: ${orderId}`);
  });

  // Handle driver location updates
  socket.on('driver_location_update', (data) => {
    const { driverId, latitude, longitude, orderId } = data;
    
    // Broadcast to order tracking room
    if (orderId) {
      socket.to(`order_${orderId}`).emit('driver_location', {
        driverId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle driver status updates
  socket.on('driver_status_update', (data) => {
    const { driverId, status } = data;
    
    // Broadcast to admin dashboard
    socket.to('admin').emit('driver_status_changed', {
      driverId,
      status,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle order status updates
  socket.on('order_status_update', (data) => {
    const { orderId, status, userId } = data;
    
    // Notify user
    socket.to(`user_${userId}`).emit('order_status_changed', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });
    
    // Notify order tracking room
    socket.to(`order_${orderId}`).emit('order_status_changed', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    const { conversationId, senderId, recipientId, message } = data;
    
    // Save message to database here
    
    // Broadcast to recipient
    socket.to(`user_${recipientId}`).emit('new_message', {
      conversationId,
      senderId,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle marketplace updates
  socket.on('new_listing', (data) => {
    // Broadcast new listing to all users
    socket.broadcast.emit('listing_created', data);
  });

  // Admin connections
  socket.on('join_admin_room', (adminId) => {
    socket.join('admin');
    console.log(`Admin ${adminId} joined admin room`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MarketPace API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
