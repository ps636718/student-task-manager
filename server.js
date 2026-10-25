const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');
const infoRoutes = require('./routes/info');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files (Frontend UI)
app.use(express.static(path.join(__dirname, 'public')));

// Top-level /health for Docker & Cloud Blueprint healthchecks
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    student: 'Pawan Suman (BT24CSD054)'
  });
});

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api', infoRoutes);

// Catch-all route to serve the Single Page Interface
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Express Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(` Student Task Manager - Practical 2`);
  console.log(` Student : Pawan Suman (BT24CSD054)`);
  console.log(` Server  : http://localhost:${PORT}`);
  console.log(` API     : http://localhost:${PORT}/api/tasks`);
  console.log(` Health  : http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});

// Graceful Docker Container Shutdown
const handleShutdown = (signal) => {
  console.log(`Received ${signal}. Gracefully shutting down Express server...`);
  server.close(() => {
    console.log('HTTP server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = app;
