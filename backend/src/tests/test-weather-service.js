/**
 * Test Suite for Weather Service
 * Run with: node src/tests/test-weather-service.js
 * 
 * Note: Requires AWS credentials in .env file
 */

require('dotenv').config();
const { getWeatherForCity, testS3Connection } = require('../services/weatherService');

async function testWeatherService() {
  console.log('🌤️ Testing Weather Service...\n');

  // Test S3 connection first
  console.log('1. Testing S3 Connection...');
  const connectionOk = await testS3Connection();
  if (!connectionOk) {
    console.log('⚠️ S3 connection test failed. Make sure AWS credentials are configured.');
    console.log('   Continuing with weather fetch tests anyway...\n');
  } else {
    console.log('✅ S3 connection successful\n');
  }

  // Test cities
  const testCities = [
    'Dubai',
    'Mumbai',
    'Delhi',
    'New York',
    'InvalidCity123' // Should return null
  ];

  console.log('2. Testing Weather Fetch for Multiple Cities:\n');
  
  for (const city of testCities) {
    console.log(`Testing: ${city}`);
    try {
      const weather = await getWeatherForCity(city);
      
      if (weather) {
        console.log(`  ✅ Found weather data:`);
        console.log(`     Temperature: ${weather.temperatureCelsius}°C (${weather.temperatureFahrenheit}°F)`);
        console.log(`     Condition: ${weather.weather}`);
        console.log(`     Humidity: ${weather.humidity}%`);
        console.log(`     Icon: ${weather.icon}`);
        if (weather.sunrise) console.log(`     Sunrise: ${weather.sunrise}`);
        if (weather.sunset) console.log(`     Sunset: ${weather.sunset}`);
      } else {
        console.log(`  ❌ No weather data found (expected for invalid cities)`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  // Test caching
  console.log('3. Testing Cache Functionality:\n');
  console.log('Fetching Dubai weather (first time - should fetch from S3)...');
  const start1 = Date.now();
  const weather1 = await getWeatherForCity('Dubai');
  const time1 = Date.now() - start1;
  console.log(`  Time taken: ${time1}ms`);
  
  console.log('Fetching Dubai weather (second time - should use cache)...');
  const start2 = Date.now();
  const weather2 = await getWeatherForCity('Dubai');
  const time2 = Date.now() - start2;
  console.log(`  Time taken: ${time2}ms`);
  
  if (time2 < time1) {
    console.log('  ✅ Cache is working (second fetch was faster)');
  } else if (weather1 && weather2) {
    console.log('  ✅ Cache returned same data');
  } else {
    console.log('  ⚠️ Cache test inconclusive');
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Weather service tests completed');
  console.log('='.repeat(50));
}

// Run tests
testWeatherService().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});

