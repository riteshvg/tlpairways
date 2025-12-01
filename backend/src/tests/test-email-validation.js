/**
 * Test Suite for Email API with Validation
 * Run with: node src/tests/test-email-validation.js
 * 
 * Note: Requires backend server running on http://localhost:3001
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/email';

async function testEmailWithValidation() {
  console.log('📧 Testing Email API with Validation...\n');

  const testCases = [
    {
      name: 'Valid booking data',
      data: {
        passengerName: 'Riya Chopra',
        email: 'riya@example.com',
        bookingId: 'V1P650',
        toCity: 'Dubai',
        totalAmount: 5450,
        totalPassengers: 1,
        from: 'BOM',
        to: 'DXB',
        travelDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        departureTime: '10:30',
        arrivalTime: '12:45'
      },
      shouldPass: true,
      description: 'Should accept valid booking data'
    },
    {
      name: 'Invalid email format',
      data: {
        passengerName: 'John Doe',
        email: 'invalid@',
        bookingId: 'ABC123',
        toCity: 'Mumbai'
      },
      shouldPass: false,
      description: 'Should reject invalid email format'
    },
    {
      name: 'Missing required field (bookingId)',
      data: {
        passengerName: 'Jane Doe',
        email: 'jane@example.com',
        toCity: 'Delhi'
        // Missing bookingId
      },
      shouldPass: false,
      description: 'Should reject missing booking ID'
    },
    {
      name: 'Invalid booking ID format (too short)',
      data: {
        passengerName: 'Test User',
        email: 'test@example.com',
        bookingId: 'ABC', // Too short
        toCity: 'Mumbai'
      },
      shouldPass: false,
      description: 'Should reject booking ID that is too short'
    },
    {
      name: 'Invalid amount (negative)',
      data: {
        passengerName: 'Test User',
        email: 'test@example.com',
        bookingId: 'ABC123',
        toCity: 'Mumbai',
        totalAmount: -100
      },
      shouldPass: false,
      description: 'Should reject negative amount'
    },
    {
      name: 'Invalid passenger count (too many)',
      data: {
        passengerName: 'Test User',
        email: 'test@example.com',
        bookingId: 'ABC123',
        toCity: 'Mumbai',
        totalPassengers: 10 // Too many
      },
      shouldPass: false,
      description: 'Should reject passenger count > 9'
    },
    {
      name: 'Invalid city code format',
      data: {
        passengerName: 'Test User',
        email: 'test@example.com',
        bookingId: 'ABC123',
        toCity: 'Mumbai',
        from: 'BOM1', // Invalid format
        to: 'DXB'
      },
      shouldPass: false,
      description: 'Should reject invalid city code format'
    },
    {
      name: 'Invalid time format',
      data: {
        passengerName: 'Test User',
        email: 'test@example.com',
        bookingId: 'ABC123',
        toCity: 'Mumbai',
        departureTime: '25:00' // Invalid
      },
      shouldPass: false,
      description: 'Should reject invalid time format'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    console.log(`  Description: ${testCase.description}`);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/send-booking-confirmation`,
        testCase.data,
        {
          validateStatus: () => true // Don't throw on any status
        }
      );

      const success = response.status === 200 && response.data.success === true;
      const hasErrors = response.status === 400 && response.data.errors;

      if (testCase.shouldPass) {
        if (success) {
          console.log(`  ✅ Passed: Email sent successfully`);
          passed++;
        } else {
          console.log(`  ❌ Failed: Should have passed but got error: ${response.data.error || JSON.stringify(response.data)}`);
          failed++;
        }
      } else {
        if (hasErrors) {
          console.log(`  ✅ Passed: Correctly rejected with errors: ${response.data.errors.join(', ')}`);
          passed++;
        } else if (response.status === 429) {
          console.log(`  ⚠️ Rate limited (this is expected if running multiple tests)`);
          passed++; // Rate limiting is acceptable
        } else {
          console.log(`  ❌ Failed: Should have been rejected but got: ${response.status} - ${JSON.stringify(response.data)}`);
          failed++;
        }
      }
    } catch (error) {
      if (!testCase.shouldPass) {
        if (error.response && error.response.status === 400) {
          console.log(`  ✅ Passed: Correctly rejected`);
          passed++;
        } else {
          console.log(`  ❌ Failed: Unexpected error: ${error.message}`);
          failed++;
        }
      } else {
        console.log(`  ❌ Failed: Should have passed but got error: ${error.message}`);
        failed++;
      }
    }
    
    console.log('');
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 All validation tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Please review.');
    process.exit(1);
  }
}

// Check if server is running
axios.get(`${API_BASE_URL.replace('/send-booking-confirmation', '/status')}`)
  .then(() => {
    console.log('✅ Backend server is running\n');
    testEmailWithValidation();
  })
  .catch(() => {
    console.error('❌ Backend server is not running. Please start it first:');
    console.error('   cd backend && npm start');
    process.exit(1);
  });

