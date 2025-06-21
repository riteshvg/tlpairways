// Root index.js - Entry point for the application
// This file ensures the backend server can be found by Render

const path = require('path');
const backendPath = path.join(__dirname, 'backend', 'src', 'index.js');

try {
  require(backendPath);
} catch (error) {
  console.error('Error starting backend server:', error);
  console.error('Backend path:', backendPath);
  console.error('Current directory:', __dirname);
  process.exit(1);
} 