const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
const connectDB = require('./config/database');
const corsMiddleware = require('./middleware/cors');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://dev-q6p3jrm5pbykuq23.us.auth0.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://dev-q6p3jrm5pbykuq23.us.auth0.com"],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:",
        "https://images.unsplash.com",
        "https://*.unsplash.com",
        "https://www.gravatar.com",
        "https://*.gravatar.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://dev-q6p3jrm5pbykuq23.us.auth0.com",
        "https://*.auth0.com",
        "https://assets.adobedtm.com",
        "https://*.adobedtm.com"
      ],
      connectSrc: [
        "'self'",
        "http://localhost:3001",
        "http://localhost:5000",
        "https://tlpairways.up.railway.app",
        "https://*.up.railway.app",
        "https://dev-q6p3jrm5pbykuq23.us.auth0.com",
        "https://*.auth0.com",
        "https://api.tlairways.com",
        "https://assets.adobedtm.com",
        "https://*.adobedtm.com",
        "https://*.adobe.com",
        "https://*.adobe.io",
        "https://*.demdex.net",
        "https://adobedc.demdex.net",
        "https://edge.adobedc.net",
        "https://*.tt.omtrdc.net",
        "https://*.sc.omtrdc.net",
        "https://*.adobedc.net"
      ],
      frameSrc: [
        "'self'",
        "https://dev-q6p3jrm5pbykuq23.us.auth0.com",
        "https://*.auth0.com",
        "https://assets.adobedtm.com",
        "https://*.adobedtm.com"
      ],
      formAction: [
        "'self'",
        "https://dev-q6p3jrm5pbykuq23.us.auth0.com"
      ]
    }
  }
}));

app.use(compression());

// Use custom CORS middleware
app.use(corsMiddleware);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoints (must be before other routes)
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({ 
    status: 'OK',
    server: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatusMap[dbStatus] || 'unknown',
      connected: dbStatus === 1
    },
    version: '1.0.0'
  });
});

// Root health check (backup)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'TLAirways Backend is running' });
});

// API Routes
app.use('/api/flights', require('./routes/flights'));
app.use('/api/airports', require('./routes/airports'));
app.use('/api/user-location', require('./routes/userLocation'));
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/email', require('./routes/email'));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build directory
  app.use(express.static(path.join(__dirname, '../../frontend/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💊 Health check: http://localhost:${PORT}/api/health`);
});
