/**
 * Test Suite for Validation Utilities
 * Run with: node src/tests/test-validators.js
 */

const {
  isValidEmail,
  isValidBookingId,
  isValidPhoneNumber,
  isValidAmount,
  isValidPassengerCount,
  isValidCityCode,
  isValidFutureDate,
  isValidTime,
  sanitizeString,
  isValidTemperature,
  isValidHumidity,
  isValidCity,
  validateBookingData
} = require('../utils/validators');

console.log('🧪 Testing Validators...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

// Email Validation Tests
console.log('📧 Email Validation:');
test('valid@example.com', () => isValidEmail('valid@example.com'));
test('user.name+tag@example.co.uk', () => isValidEmail('user.name+tag@example.co.uk'));
test('invalid@ (missing domain)', () => !isValidEmail('invalid@'));
test('@invalid.com (missing local)', () => !isValidEmail('@invalid.com'));
test('invalid (no @)', () => !isValidEmail('invalid'));
test('empty string', () => !isValidEmail(''));
test('null', () => !isValidEmail(null));
test('undefined', () => !isValidEmail(undefined));

// Booking ID Validation Tests
console.log('\n🎫 Booking ID Validation:');
test('ABC123 (valid)', () => isValidBookingId('ABC123'));
test('V1P650 (valid)', () => isValidBookingId('V1P650'));
test('ABC123456789012345 (20 chars, valid)', () => isValidBookingId('ABC123456789012345'));
test('abc123 (lowercase)', () => isValidBookingId('abc123')); // Case insensitive
test('ABC (too short)', () => !isValidBookingId('ABC'));
test('ABC1234567890123456 (too long)', () => !isValidBookingId('ABC1234567890123456'));
test('ABC-123 (special chars)', () => !isValidBookingId('ABC-123'));

// Phone Number Validation Tests
console.log('\n📱 Phone Number Validation:');
test('+971501234567 (E.164)', () => isValidPhoneNumber('+971501234567'));
test('971501234567 (without +)', () => isValidPhoneNumber('971501234567'));
test('+1-555-123-4567 (with dashes)', () => isValidPhoneNumber('+1-555-123-4567'));
test('(555) 123-4567 (with parentheses)', () => isValidPhoneNumber('(555) 123-4567'));
test('123 (too short)', () => !isValidPhoneNumber('123'));
test('empty string', () => !isValidPhoneNumber(''));

// Amount Validation Tests
console.log('\n💰 Amount Validation:');
test('5450 (valid)', () => isValidAmount(5450));
test('0.01 (valid minimum)', () => isValidAmount(0.01));
test('1000000 (valid maximum)', () => isValidAmount(1000000));
test('0 (invalid)', () => !isValidAmount(0));
test('-100 (invalid negative)', () => !isValidAmount(-100));
test('1000001 (too large)', () => !isValidAmount(1000001));

// Passenger Count Validation Tests
console.log('\n👥 Passenger Count Validation:');
test('1 (valid)', () => isValidPassengerCount(1));
test('9 (valid maximum)', () => isValidPassengerCount(9));
test('0 (invalid)', () => !isValidPassengerCount(0));
test('10 (too many)', () => !isValidPassengerCount(10));

// City Code Validation Tests
console.log('\n🏙️ City Code Validation:');
test('DXB (valid)', () => isValidCityCode('DXB'));
test('BOM (valid)', () => isValidCityCode('BOM'));
test('dxb (lowercase invalid)', () => !isValidCityCode('dxb'));
test('DX (too short)', () => !isValidCityCode('DX'));
test('DXBA (too long)', () => !isValidCityCode('DXBA'));

// Date Validation Tests
console.log('\n📅 Future Date Validation:');
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 1);
test('Future date', () => isValidFutureDate(futureDate.toISOString()));
test('Past date', () => !isValidFutureDate('2020-01-01'));
test('Today (should be invalid)', () => {
  const today = new Date().toISOString();
  return !isValidFutureDate(today); // Today is not in the future
});

// Time Validation Tests
console.log('\n⏰ Time Validation:');
test('10:30 (valid)', () => isValidTime('10:30'));
test('23:59 (valid)', () => isValidTime('23:59'));
test('00:00 (valid)', () => isValidTime('00:00'));
test('24:00 (invalid)', () => !isValidTime('24:00'));
test('10:60 (invalid)', () => !isValidTime('10:60'));
test('1:30 (invalid format)', () => !isValidTime('1:30'));

// Temperature Validation Tests
console.log('\n🌡️ Temperature Validation:');
test('298K (25°C, valid)', () => isValidTemperature(298));
test('273K (0°C, valid)', () => isValidTemperature(273));
test('333K (60°C, valid)', () => isValidTemperature(333));
test('223K (-50°C, valid)', () => isValidTemperature(223));
test('400K (127°C, invalid)', () => !isValidTemperature(400));
test('200K (-73°C, invalid)', () => !isValidTemperature(200));

// Humidity Validation Tests
console.log('\n💧 Humidity Validation:');
test('42 (valid)', () => isValidHumidity(42));
test('0 (valid minimum)', () => isValidHumidity(0));
test('100 (valid maximum)', () => isValidHumidity(100));
test('-1 (invalid)', () => !isValidHumidity(-1));
test('101 (invalid)', () => !isValidHumidity(101));

// City Name Validation Tests
console.log('\n🌍 City Name Validation:');
test('Dubai (valid)', () => isValidCity('Dubai'));
test('New York (valid)', () => isValidCity('New York'));
test('empty string', () => !isValidCity(''));
test('null', () => !isValidCity(null));

// Sanitize String Tests
console.log('\n🧹 String Sanitization:');
test('Remove HTML tags', () => {
  const result = sanitizeString('<script>alert("xss")</script>');
  return !result.includes('<') && !result.includes('>');
});
test('Remove javascript: protocol', () => {
  const result = sanitizeString('javascript:alert("xss")');
  return !result.includes('javascript:');
});

// Complete Booking Data Validation Tests
console.log('\n📋 Complete Booking Data Validation:');
test('Valid booking data', () => {
  const result = validateBookingData({
    email: 'test@example.com',
    bookingId: 'ABC123',
    passengerName: 'John Doe',
    toCity: 'Dubai',
    phone: '+971501234567',
    totalAmount: 5450,
    totalPassengers: 1
  });
  return result.valid === true && result.errors.length === 0;
});

test('Missing required fields', () => {
  const result = validateBookingData({
    email: 'test@example.com'
    // Missing bookingId, passengerName, toCity
  });
  return result.valid === false && result.errors.length > 0;
});

test('Invalid email format', () => {
  const result = validateBookingData({
    email: 'invalid@',
    bookingId: 'ABC123',
    passengerName: 'John Doe',
    toCity: 'Dubai'
  });
  return result.valid === false && result.errors.some(e => e.includes('email'));
});

test('Invalid booking ID format', () => {
  const result = validateBookingData({
    email: 'test@example.com',
    bookingId: 'ABC', // Too short
    passengerName: 'John Doe',
    toCity: 'Dubai'
  });
  return result.valid === false && result.errors.some(e => e.includes('booking ID'));
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️ Some tests failed. Please review.');
  process.exit(1);
}

