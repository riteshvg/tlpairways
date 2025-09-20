const cors = require('cors');

// CORS configuration for Adobe Analytics
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? ['https://tlpairways.up.railway.app'] 
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5000', 'http://localhost:5001', 'http://localhost:5002'];
    
    // Allow Adobe Analytics domains
    const adobeDomains = [
      'https://assets.adobedtm.com',
      'https://*.adobedtm.com',
      'https://*.adobe.com'
    ];
    
    // Allow Auth0 domains
    const auth0Domains = [
      'https://dev-q6p3jrm5pbykuq23.us.auth0.com',
      'https://*.auth0.com'
    ];
    
    const allAllowedOrigins = [...allowedOrigins, ...adobeDomains, ...auth0Domains];
    
    if (allAllowedOrigins.indexOf(origin) !== -1 || 
        adobeDomains.some(domain => origin.includes(domain.replace('https://', '').replace('*.', ''))) ||
        auth0Domains.some(domain => origin.includes(domain.replace('https://', '').replace('*.', '')))) {
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