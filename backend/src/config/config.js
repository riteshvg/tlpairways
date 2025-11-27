require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tlairways',

  // CORS Configuration
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],

  // Adobe Analytics Configuration
  adobeAnalytics: {
    enabled: process.env.ADOBE_ANALYTICS_ENABLED === 'true',
    scriptUrl: process.env.ADOBE_SCRIPT_URL || 'https://assets.adobedtm.com/22bf1a13013f/ba7976888d86/launch-07179a193336-development.min.js',
    async: true,
    environment: process.env.ADOBE_ENVIRONMENT || 'development'
  },

  // Security
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  sessionSecret: process.env.SESSION_SECRET || 'your-super-secret-session-key-here',

  // API Keys
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,

  // App Configuration
  appName: 'TLAirways',
  appVersion: '1.0.0'
};

module.exports = config; 