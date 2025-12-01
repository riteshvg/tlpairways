/**
 * Test Email with Weather Integration
 * Sends a test booking confirmation email with weather data
 * 
 * Usage: node src/scripts/test-email-with-weather.js
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/email';

async function testEmailWithWeather() {
  console.log('🧪 Testing Email with Weather Integration...\n');

  // Test data for Dubai (weather data exists in events folder)
  const testBookingData = {
    // Passenger Information
    passengerName: 'Test User',
    email: process.env.TEST_EMAIL || 'test@example.com', // Change this to your email
    phone: '+971501234567',
    
    // Booking Reference
    bookingId: 'TEST123',
    pnr: 'TEST123',
    bookingDate: new Date().toISOString(),
    bookingStatus: 'Confirmed',
    
    // Flight Details
    flightNumber: 'TW6622',
    airline: 'TLP Airways',
    aircraftType: 'Boeing 737-800',
    
    // Route Information
    from: 'BOM',
    fromCity: 'Mumbai',
    fromAirport: 'Chhatrapati Shivaji Maharaj International Airport',
    fromTerminal: 'T2',
    to: 'DXB',
    toCity: 'Dubai', // This will trigger weather lookup
    toAirport: 'Dubai International Airport',
    toTerminal: 'T3',
    route: 'BOM-DXB',
    
    // Timing
    travelDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    departureTime: '10:30',
    arrivalTime: '12:45',
    duration: '2h 15m',
    
    // Trip Type
    tripType: 'oneway',
    
    // Passengers
    adults: 1,
    children: 0,
    infants: 0,
    totalPassengers: 1,
    passengers: [
      {
        name: 'Test User',
        age: 30,
        seat: '12A',
        meal: 'Vegetarian'
      }
    ],
    
    // Class & Fare
    travelClass: 'Economy',
    fareType: 'Regular',
    
    // Pricing
    baseFare: 5000,
    taxes: 450,
    totalAmount: 5450,
    currency: 'INR',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    
    // Baggage
    cabinBaggage: '7 kg',
    checkinBaggage: '15 kg',
    
    // Links (optional)
    bookingUrl: 'https://tlpairways.thelearningproject.in/booking/TEST123',
    checkinUrl: 'https://tlpairways.thelearningproject.in/checkin',
    eTicketUrl: 'https://tlpairways.thelearningproject.in/eticket/TEST123',
    manageBookingUrl: 'https://tlpairways.thelearningproject.in/manage/TEST123'
  };

  console.log('📧 Sending test email to:', testBookingData.email);
  console.log('🌍 Destination city:', testBookingData.toCity);
  console.log('   (Weather data will be fetched from events folder)\n');

  try {
    const response = await axios.post(
      `${API_BASE_URL}/send-booking-confirmation`,
      testBookingData,
      {
        validateStatus: () => true // Don't throw on any status
      }
    );

    if (response.status === 200 && response.data.success) {
      console.log('✅ Email sent successfully!');
      console.log('   Message ID:', response.data.messageId);
      console.log('   Weather included:', response.data.weatherIncluded ? '✅ Yes' : '❌ No');
      console.log('\n📬 Check your inbox at:', testBookingData.email);
      console.log('   Look for the weather section in the email (blue gradient box)');
    } else if (response.status === 400) {
      console.log('❌ Validation errors:');
      console.log('   ', response.data.errors?.join('\n   ') || response.data.error);
    } else if (response.status === 429) {
      console.log('⚠️  Rate limit exceeded. Please wait a minute and try again.');
    } else {
      console.log('❌ Failed to send email:');
      console.log('   Status:', response.status);
      console.log('   Error:', response.data.error || JSON.stringify(response.data));
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to backend server.');
      console.log('   Make sure the backend is running:');
      console.log('   cd backend && npm start');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// Check if backend is running
axios.get(`${API_BASE_URL.replace('/send-booking-confirmation', '/status')}`)
  .then(() => {
    console.log('✅ Backend server is running\n');
    testEmailWithWeather();
  })
  .catch(() => {
    console.error('❌ Backend server is not running.');
    console.error('   Please start it first:');
    console.error('   cd backend && npm start');
    console.error('\n   Or use: ./start-dev.sh');
    process.exit(1);
  });

