/**
 * Email Service Test Script
 * Tests the Brevo email configuration and sends a test email
 * 
 * Usage: node src/scripts/testEmail.js [email]
 * Example: node src/scripts/testEmail.js test@example.com
 */

require('dotenv').config();
const { sendBookingConfirmationEmail, getEmailServiceStatus } = require('../services/emailService');

const TEST_EMAIL = process.argv[2] || process.env.TEST_EMAIL;

async function testEmailStatus() {
  console.log('\n📋 Testing Email Service Status...\n');
  
  const status = getEmailServiceStatus();
  console.log('Email Service Status:');
  console.log(JSON.stringify(status, null, 2));
  return status;
}

async function testEmailSend(email) {
  if (!email) {
    console.error('\n❌ Email address required!');
    console.log('Usage: node src/scripts/testEmail.js [email]');
    console.log('Example: node src/scripts/testEmail.js test@example.com');
    return;
  }

  console.log(`\n📧 Testing Email Send to ${email}...\n`);

  const testData = {
    passengerName: 'Test User',
    email: email,
    bookingId: 'TEST123456',
    route: 'DEL-BOM',
    travelDate: '2025-01-25',
    passengers: '1 Adult',
    from: 'Delhi',
    to: 'Mumbai',
    flightNumber: 'TL101',
    adults: 1,
    children: 0
  };

  console.log('Request Data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n');

  try {
    const result = await sendBookingConfirmationEmail(testData);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('Message:', result.message);
    } else {
      console.error('❌ Email send failed:');
      console.error('Error:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
    }
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function validateEnvironment() {
  console.log('\n🔍 Validating Environment Variables...\n');
  
  const required = {
    'BREVO_API_KEY': process.env.BREVO_API_KEY ? '***SET***' : 'MISSING',
    'SENDER_EMAIL': process.env.SENDER_EMAIL || 'MISSING',
    'SENDER_NAME': process.env.SENDER_NAME || 'TLP Airways (default)'
  };

  console.log('Required Variables:');
  Object.entries(required).forEach(([key, value]) => {
    const status = value === 'MISSING' ? '❌' : '✅';
    console.log(`  ${status} ${key}: ${value}`);
  });

  const allSet = Object.values(required).every(v => v !== 'MISSING');
  console.log(`\n${allSet ? '✅' : '❌'} Environment Configuration: ${allSet ? 'COMPLETE' : 'INCOMPLETE'}\n`);
  
  return allSet;
}

async function main() {
  console.log('📧 Brevo Email Integration Test\n');
  console.log('='.repeat(50));

  // Validate environment
  const envValid = await validateEnvironment();
  
  if (!envValid) {
    console.log('\n⚠️  Please set all required environment variables in .env file');
    console.log('See backend/env.template.txt for reference\n');
    process.exit(1);
  }

  // Test status
  const status = await testEmailStatus();
  
  if (!status.configured) {
    console.log('\n⚠️  Email service is not properly configured');
    process.exit(1);
  }

  // Test send if email provided
  if (TEST_EMAIL) {
    console.log('\n' + '='.repeat(50));
    await testEmailSend(TEST_EMAIL);
  } else {
    console.log('\n💡 To test sending an email, provide an email address:');
    console.log('   node src/scripts/testEmail.js test@example.com');
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Validation Complete!\n');
}

main().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});

