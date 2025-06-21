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