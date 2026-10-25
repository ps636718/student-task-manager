const express = require('express');
const router = express.Router();
const os = require('os');
const taskStorage = require('../storage/taskStorage');

// GET /api/stats - dashboard statistics
router.get('/stats', (req, res) => {
  try {
    const stats = taskStorage.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/health - healthcheck endpoint for Docker & Cloud Ping
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    hostname: os.hostname(),
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    containerized: fsExistsInDocker()
  });
});

// GET /api/student-info - student and practical metadata
router.get('/student-info', (req, res) => {
  res.json({
    practical: 'Practical 2: Dockerization and Cloud Deployment of a Node.js Web Application',
    studentName: 'Pawan Suman',
    btId: 'BT24CSD054',
    aim: 'Develop a Node.js and Express.js web application, containerize it using Docker, and deploy it to a cloud platform.',
    architecture: {
      developer: 'VS Code + Git',
      repository: 'GitHub',
      deployment: 'Cloud Container (Render / Azure / AWS)',
      runtime: 'Docker Engine'
    }
  });
});

function fsExistsInDocker() {
  const fs = require('fs');
  return fs.existsSync('/.dockerenv');
}

module.exports = router;
