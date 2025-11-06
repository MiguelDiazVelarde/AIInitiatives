// Debug version of the server to identify startup issues
const express = require('express');
const path = require('path');

console.log('🔍 Starting debug server...');

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3000;

console.log('📝 Environment variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', PORT);
console.log('  TEST_BASE_URL:', process.env.TEST_BASE_URL);

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('📋 Health check requested');
  res.json({ status: 'OK', message: 'Debug server is running' });
});

// Basic home route
app.get('/', (req, res) => {
  console.log('🏠 Home page requested');
  res.send('Debug server is working!');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Express error:', err);
  res.status(500).json({ error: 'Server error: ' + err.message });
});

// Start server
console.log('🚀 Attempting to start server...');
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`✅ Debug server running on http://localhost:${PORT}`);
  console.log('🔍 Server startup completed successfully');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Keep alive
setInterval(() => {
  console.log('💓 Server heartbeat - still running...');
}, 10000);

console.log('🔍 Debug server script loaded, waiting for listen callback...');