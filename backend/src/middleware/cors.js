const cors = require('cors');

// CORS configuration for Adobe Analytics
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? ['https://tlairways-app.onrender.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    // Allow Adobe Analytics domains
    const adobeDomains = [
      'https://assets.adobedtm.com',
      'https://*.adobedtm.com',
      'https://*.adobe.com'
    ];
    
    const allAllowedOrigins = [...allowedOrigins, ...adobeDomains];
    
    if (allAllowedOrigins.indexOf(origin) !== -1 || 
        adobeDomains.some(domain => origin.includes(domain.replace('https://', '').replace('*.', '')))) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-Forwarded-For',
    'X-Real-IP'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

module.exports = cors(corsOptions); 