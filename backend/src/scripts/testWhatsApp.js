/**
 * WhatsApp Integration Test Script
 * Tests the WhatsApp configuration and sends a test message
 * 
 * Usage: node src/scripts/testWhatsApp.js [phoneNumber]
 * Example: node src/scripts/testWhatsApp.js 919876543210
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const TEST_PHONE = process.argv[2] || process.env.TEST_PHONE_NUMBER;

async function testWhatsAppStatus() {
  console.log('\n📋 Testing WhatsApp Service Status...\n');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/whatsapp/status`);
    console.log('✅ Status Check Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Status Check Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

async function testWhatsAppSend(phoneNumber) {
  if (!phoneNumber) {
    console.error('\n❌ Phone number required!');
    console.log('Usage: node src/scripts/testWhatsApp.js [phoneNumber]');
    console.log('Example: node src/scripts/testWhatsApp.js 919876543210');
    return;
  }

  console.log(`\n📤 Testing WhatsApp Send to ${phoneNumber}...\n`);

  const testData = {
    to: phoneNumber,
    templateName: 'flight_booking_confirmation',
    templateParams: {
      passengerName: 'Test User',
      ticketNumber: 'TEST123456',
      route: 'DEL-BOM',
      travelDate: '2025-01-25',
      passengersCount: '1',
      email: 'test@example.com'
    }
  };

  console.log('Request Data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n');

  try {
    const response = await axios.post(`${API_BASE_URL}/whatsapp/send`, testData);
    console.log('✅ Send Test Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Send Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

async function validateEnvironment() {
  console.log('\n🔍 Validating Environment Variables...\n');
  
  const required = {
    'WHATSAPP_PROVIDER': process.env.WHATSAPP_PROVIDER,
    'WHATSAPP_API_KEY': process.env.WHATSAPP_API_KEY ? '***SET***' : 'MISSING',
    'WHATSAPP_PHONE_NUMBER_ID': process.env.WHATSAPP_PHONE_NUMBER_ID || 'MISSING'
  };

  const provider = process.env.WHATSAPP_PROVIDER || 'meta';
  
  if (provider === 'meta') {
    console.log('Provider: Meta WhatsApp Business API');
    console.log('Required Variables:');
    Object.entries(required).forEach(([key, value]) => {
      const status = value === 'MISSING' ? '❌' : '✅';
      console.log(`  ${status} ${key}: ${value}`);
    });
  } else if (provider === 'twilio') {
    console.log('Provider: Twilio');
    console.log('Required Variables:');
    console.log(`  ${process.env.TWILIO_ACCOUNT_SID ? '✅' : '❌'} TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '***SET***' : 'MISSING'}`);
    console.log(`  ${process.env.TWILIO_AUTH_TOKEN ? '✅' : '❌'} TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '***SET***' : 'MISSING'}`);
    console.log(`  ${process.env.TWILIO_WHATSAPP_NUMBER ? '✅' : '❌'} TWILIO_WHATSAPP_NUMBER: ${process.env.TWILIO_WHATSAPP_NUMBER || 'MISSING'}`);
  }

  const allSet = Object.values(required).every(v => v !== 'MISSING' && v);
  console.log(`\n${allSet ? '✅' : '❌'} Environment Configuration: ${allSet ? 'COMPLETE' : 'INCOMPLETE'}\n`);
  
  return allSet;
}

async function main() {
  console.log('🚀 WhatsApp Integration Test\n');
  console.log('='.repeat(50));

  // Validate environment
  const envValid = await validateEnvironment();
  
  if (!envValid) {
    console.log('\n⚠️  Please set all required environment variables in .env file');
    console.log('See backend/env.template.txt for reference\n');
    process.exit(1);
  }

  // Test status endpoint
  const status = await testWhatsAppStatus();
  
  if (!status || status.status === 'not_configured') {
    console.log('\n⚠️  WhatsApp service is not properly configured');
    process.exit(1);
  }

  // Test send if phone number provided
  if (TEST_PHONE) {
    console.log('\n' + '='.repeat(50));
    await testWhatsAppSend(TEST_PHONE);
  } else {
    console.log('\n💡 To test sending a message, provide a phone number:');
    console.log('   node src/scripts/testWhatsApp.js 919876543210');
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Validation Complete!\n');
}

main().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});

