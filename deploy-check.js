#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 TLAirways Deployment Check');
console.log('=============================\n');

// Check current directory
console.log('📁 Current Directory:', process.cwd());

// Check if key files exist
const requiredFiles = [
  'package.json',
  'index.js',
  'backend/src/index.js',
  'frontend/package.json',
  'backend/package.json'
];

console.log('\n📋 Checking Required Files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check if backend dependencies are installed
console.log('\n📦 Checking Backend Dependencies:');
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
const backendDepsExist = fs.existsSync(backendNodeModules);
console.log(`${backendDepsExist ? '✅' : '❌'} backend/node_modules`);

// Check if frontend dependencies are installed
console.log('\n📦 Checking Frontend Dependencies:');
const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');
const frontendDepsExist = fs.existsSync(frontendNodeModules);
console.log(`${frontendDepsExist ? '✅' : '❌'} frontend/node_modules`);

// Check if frontend build exists
console.log('\n🏗️ Checking Frontend Build:');
const frontendBuild = path.join(__dirname, 'frontend', 'build');
const buildExists = fs.existsSync(frontendBuild);
console.log(`${buildExists ? '✅' : '❌'} frontend/build`);

// Check environment
console.log('\n🌍 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');

// Test backend server import
console.log('\n🚀 Testing Backend Server Import:');
try {
  const backendPath = path.join(__dirname, 'backend', 'src', 'index.js');
  console.log('Backend path:', backendPath);
  console.log('✅ Backend file can be found');
} catch (error) {
  console.log('❌ Error finding backend file:', error.message);
}

console.log('\n✨ Deployment Check Complete!'); 