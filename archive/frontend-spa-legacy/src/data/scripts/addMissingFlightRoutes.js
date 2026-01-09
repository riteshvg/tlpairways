const fs = require('fs');
const path = require('path');

// Read airports data
const airportsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../airports.json'), 'utf8')
);

// Read existing flights
const flightsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../flights.json'), 'utf8')
);

// Build airport code to city/country mapping
const airportMap = {};
airportsData.airports.forEach(city => {
  city.airports.forEach(airport => {
    airportMap[airport.code] = {
      code: airport.code,
      city: city.city,
      country: city.country,
      coordinates: airport.coordinates
    };
  });
});

// Extract all existing flight routes
const existingRoutes = new Set();
flightsData.flights.forEach(flight => {
  const route = `${flight.origin}-${flight.destination}`;
  existingRoutes.add(route);
});

// Get all airport codes
const airportCodes = Object.keys(airportMap).sort();

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Realistic duration calculation based on distance
function calculateDuration(distance) {
  // Average aircraft speed: 850 km/h
  // Add operational time (taxi, takeoff, landing): 30-45 minutes
  const flightTime = (distance / 850) * 60; // in minutes
  const operationalTime = 30 + Math.random() * 15; // 30-45 minutes
  return Math.round(flightTime + operationalTime);
}

// Generate flight number
function generateFlightNumber() {
  const airlines = ['TL', 'TP', 'TW', 'TX', 'TY'];
  const airline = airlines[Math.floor(Math.random() * airlines.length)];
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${airline}${number}`;
}

// Generate aircraft type based on distance
function getAircraftType(distance) {
  if (distance < 1000) return 'A320neo';
  if (distance < 3000) return 'A321neo';
  if (distance < 6000) return 'B787-8';
  return 'B777-300ER';
}

// Calculate price based on distance
function calculatePrice(distance) {
  const isDomestic = distance < 2000;
  const isShortHaul = distance < 3000;
  
  let basePrice;
  
  if (isDomestic) {
    if (isShortHaul) {
      basePrice = 5000 + Math.random() * 5000; // 5000-10000
    } else {
      basePrice = 10000 + Math.random() * 10000; // 10000-20000
    }
  } else {
    if (isShortHaul) {
      basePrice = 50000 + Math.random() * 10000; // 50000-60000
    } else {
      basePrice = 80000 + Math.random() * 120000; // 80000-200000
    }
  }
  
  return Math.floor(basePrice);
}

// Format time
function formatTime(hours, minutes) {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Generate flights for a route
function generateFlightsForRoute(originCode, destCode, numFlights = 4) {
  const origin = airportMap[originCode];
  const dest = airportMap[destCode];
  
  if (!origin || !dest) {
    console.warn(`⚠️  Missing airport data for ${originCode} or ${destCode}`);
    return [];
  }
  
  const distance = calculateDistance(
    origin.coordinates.latitude,
    origin.coordinates.longitude,
    dest.coordinates.latitude,
    dest.coordinates.longitude
  );
  
  const durationMinutes = calculateDuration(distance);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const duration = `${hours}h ${minutes}m`;
  
  const flights = [];
  const departureTimes = [6, 10, 14, 18]; // Morning, afternoon, evening, night
  
  for (let i = 0; i < numFlights; i++) {
    const departureHour = departureTimes[i % departureTimes.length];
    const departureMinute = Math.floor(Math.random() * 60);
    const departureTime = formatTime(departureHour, departureMinute);
    
    // Calculate arrival time
    let arrivalHour = departureHour + hours;
    let arrivalMinute = departureMinute + minutes;
    if (arrivalMinute >= 60) {
      arrivalHour += 1;
      arrivalMinute -= 60;
    }
    if (arrivalHour >= 24) {
      arrivalHour -= 24;
    }
    const arrivalTime = formatTime(arrivalHour, arrivalMinute);
    
    const price = calculatePrice(distance);
    const priceVariation = 1 + (i * 0.1); // 10% variation per flight
    const finalPrice = Math.floor(price * priceVariation);
    
    flights.push({
      id: `flight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      flightNumber: generateFlightNumber(),
      origin: originCode,
      originCity: origin.city,
      destination: destCode,
      destinationCity: dest.city,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      duration: duration,
      durationMinutes: durationMinutes,
      price: finalPrice,
      aircraftType: getAircraftType(distance),
      stops: [],
      availableSeats: Math.floor(Math.random() * 50) + 10,
      cabinClass: ['Economy', 'Business', 'First'],
      mealOptions: ['Veg', 'Non-Veg', 'Vegan'],
      baggage: {
        checked: '23 kg',
        cabin: '7 kg'
      },
      distance: Math.round(distance)
    });
  }
  
  return flights;
}

// Priority routes to add first (high-demand routes)
const priorityRoutes = [
  // India -> UAE (including CCU-DXB)
  'CCU-DXB', 'CCU-AUH', 'HYD-DXB', 'HYD-AUH', 'BLR-DXB', 'BLR-AUH',
  'MAA-DXB', 'MAA-AUH', 'COK-DXB', 'COK-AUH', 'AMD-DXB', 'AMD-AUH',
  
  // India -> Middle East
  'CCU-DOH', 'HYD-DOH', 'BLR-DOH', 'MAA-DOH', 'CCU-KWI', 'HYD-KWI',
  'BLR-KWI', 'MAA-KWI', 'CCU-BAH', 'HYD-BAH', 'BLR-BAH', 'MAA-BAH',
  'CCU-RUH', 'HYD-RUH', 'BLR-RUH', 'MAA-RUH', 'CCU-JED', 'HYD-JED',
  
  // India -> Southeast Asia
  'CCU-SIN', 'HYD-SIN', 'BLR-SIN', 'MAA-SIN', 'COK-SIN', 'AMD-SIN',
  'CCU-KUL', 'HYD-KUL', 'BLR-KUL', 'MAA-KUL', 'COK-KUL', 'AMD-KUL',
  'CCU-BKK', 'HYD-BKK', 'BLR-BKK', 'MAA-BKK', 'COK-BKK', 'AMD-BKK',
  'CCU-HKG', 'HYD-HKG', 'BLR-HKG', 'MAA-HKG', 'COK-HKG', 'AMD-HKG',
  
  // India -> Europe
  'CCU-LHR', 'HYD-LHR', 'BLR-LHR', 'MAA-LHR', 'COK-LHR', 'AMD-LHR',
  'CCU-CDG', 'HYD-CDG', 'BLR-CDG', 'MAA-CDG', 'COK-CDG', 'AMD-CDG',
  'CCU-FRA', 'HYD-FRA', 'BLR-FRA', 'MAA-FRA', 'COK-FRA', 'AMD-FRA',
  
  // India -> US
  'CCU-JFK', 'HYD-JFK', 'BLR-JFK', 'MAA-JFK', 'COK-JFK', 'AMD-JFK',
  'CCU-SFO', 'HYD-SFO', 'BLR-SFO', 'MAA-SFO', 'COK-SFO', 'AMD-SFO',
  
  // Other important routes
  'CCU-CGK', 'HYD-CGK', 'BLR-CGK', 'MAA-CGK',
  'CCU-CMB', 'HYD-CMB', 'BLR-CMB', 'MAA-CMB',
  'CCU-HND', 'HYD-HND', 'BLR-HND', 'MAA-HND',
  'CCU-ICN', 'HYD-ICN', 'BLR-ICN', 'MAA-ICN',
];

// Find all missing routes
const missingRoutes = [];
for (let i = 0; i < airportCodes.length; i++) {
  for (let j = 0; j < airportCodes.length; j++) {
    if (i !== j) {
      const route = `${airportCodes[i]}-${airportCodes[j]}`;
      if (!existingRoutes.has(route)) {
        missingRoutes.push(route);
      }
    }
  }
}

console.log(`📊 Analysis:`);
console.log(`   Total possible routes: ${airportCodes.length * (airportCodes.length - 1)}`);
console.log(`   Existing routes: ${existingRoutes.size}`);
console.log(`   Missing routes: ${missingRoutes.length}`);
console.log('');

// Add priority routes first
console.log('🚀 Adding priority routes...');
const priorityFlights = [];
const addedPriorityRoutes = new Set();

priorityRoutes.forEach(route => {
  if (missingRoutes.includes(route) && !addedPriorityRoutes.has(route)) {
    const [origin, dest] = route.split('-');
    const flights = generateFlightsForRoute(origin, dest, 4);
    priorityFlights.push(...flights);
    addedPriorityRoutes.add(route);
    console.log(`   ✅ Added ${route} (${flights.length} flights)`);
  }
});

// Add remaining missing routes (limit to avoid huge file)
const maxRoutesToAdd = 500; // Limit to prevent file from becoming too large
const remainingRoutes = missingRoutes
  .filter(r => !addedPriorityRoutes.has(r))
  .slice(0, maxRoutesToAdd - priorityRoutes.length);

console.log(`\n📦 Adding ${remainingRoutes.length} additional routes...`);
const additionalFlights = [];
let addedCount = 0;

remainingRoutes.forEach(route => {
  const [origin, dest] = route.split('-');
  const flights = generateFlightsForRoute(origin, dest, 2); // 2 flights per route for non-priority
  additionalFlights.push(...flights);
  addedCount++;
  if (addedCount % 50 === 0) {
    console.log(`   Progress: ${addedCount}/${remainingRoutes.length} routes added`);
  }
});

// Combine all flights
const allNewFlights = [...priorityFlights, ...additionalFlights];
const updatedFlights = {
  flights: [...flightsData.flights, ...allNewFlights]
};

// Write updated flights
const outputPath = path.join(__dirname, '../flights.json');
fs.writeFileSync(outputPath, JSON.stringify(updatedFlights, null, 2));

console.log('\n✅ Success!');
console.log(`   Added ${allNewFlights.length} new flights`);
console.log(`   Priority routes: ${addedPriorityRoutes.size}`);
console.log(`   Additional routes: ${addedCount}`);
console.log(`   Total flights in database: ${updatedFlights.flights.length}`);
console.log(`\n📝 Updated file: ${outputPath}`);

