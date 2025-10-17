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

// Helper function to get airport code for a city
function getAirportCode(cityName) {
  const city = airportsData.airports.find((c) => c.city === cityName);
  if (!city || !city.airports || city.airports.length === 0) {
    return null;
  }
  // Prefer international airports
  const intlAirport = city.airports.find((a) => a.type === 'International');
  return intlAirport ? intlAirport.code : city.airports[0].code;
}

// Helper function to get coordinates for a city
function getCityCoordinates(cityName) {
  const city = airportsData.airports.find((c) => c.city === cityName);
  if (!city || !city.airports || city.airports.length === 0) {
    return null;
  }
  const airport = city.airports[0];
  return {
    lat: airport.coordinates.latitude,
    lon: airport.coordinates.longitude,
  };
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
  const airlines = ['TL', 'TP', 'TW', 'TX', 'TY']; // Generic airline codes
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

// Generate a single flight
function generateFlight(origin, dest, departureTime, isReturn = false) {
  const originCoords = getCityCoordinates(origin);
  const destCoords = getCityCoordinates(dest);
  const originCode = getAirportCode(origin);
  const destCode = getAirportCode(dest);

  if (!originCoords || !destCoords || !originCode || !destCode) {
    return null;
  }

  const distance = calculateDistance(
    originCoords.lat,
    originCoords.lon,
    destCoords.lat,
    destCoords.lon
  );

  const duration = calculateDuration(distance);
  const aircraftType = getAircraftType(distance);

  // Calculate arrival time
  const [hours, minutes] = departureTime.split(':').map(Number);
  let arrivalHours = hours + Math.floor(duration / 60);
  let arrivalMinutes = minutes + (duration % 60);

  if (arrivalMinutes >= 60) {
    arrivalHours += 1;
    arrivalMinutes -= 60;
  }

  if (arrivalHours >= 24) {
    arrivalHours -= 24;
  }

  const arrivalTime = `${String(arrivalHours).padStart(2, '0')}:${String(
    arrivalMinutes
  ).padStart(2, '0')}`;

  // Generate stops based on distance
  let stops = [];
  if (distance > 6000) {
    // Long haul flights may have 1 stop
    const possibleHubs = ['DXB', 'SIN', 'BKK', 'HKG', 'FRA', 'LHR'];
    const hub = possibleHubs[Math.floor(Math.random() * possibleHubs.length)];
    stops.push(hub);
  }

  const flight = {
    id: `flight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    flightNumber: generateFlightNumber(),
    origin: originCode,
    originCity: origin,
    destination: destCode,
    destinationCity: dest,
    departureTime,
    arrivalTime,
    duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
    durationMinutes: duration,
    price: Math.floor(
      5000 + Math.random() * 45000 + distance * (5 + Math.random() * 10)
    ),
    aircraftType,
    stops,
    availableSeats: Math.floor(Math.random() * 50) + 10,
    cabinClass: ['Economy', 'Business', 'First'],
    mealOptions: ['Veg', 'Non-Veg', 'Vegan'],
    baggage: {
      checked: '23 kg',
      cabin: '7 kg',
    },
    distance: Math.round(distance),
  };

  return flight;
}

// Generate return flight
function generateReturnFlight(onwardFlight, layoverHours = 3) {
  const [hours, minutes] = onwardFlight.arrivalTime.split(':').map(Number);
  let returnDepartureHours = hours + layoverHours;
  let returnDepartureMinutes = minutes;

  if (returnDepartureHours >= 24) {
    returnDepartureHours -= 24;
  }

  const returnDepartureTime = `${String(returnDepartureHours).padStart(
    2,
    '0'
  )}:${String(returnDepartureMinutes).padStart(2, '0')}`;

  return generateFlight(
    onwardFlight.destinationCity,
    onwardFlight.originCity,
    returnDepartureTime,
    true
  );
}

// Define comprehensive route network
// Strategy: Create a hub-and-spoke model with major hubs connecting to all cities
const routeNetwork = {
  // Major domestic hubs (connect to all domestic cities)
  domesticHubs: ['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata'],
  domesticCities: [
    'Hyderabad',
    'Kochi',
    'Ahmedabad',
    'Pune',
    'Goa',
    'Jaipur',
    'Lucknow',
    'Amritsar',
    'Guwahati',
    'Chandigarh',
    'Varanasi',
    'Bhubaneswar',
    'Surat',
    'Indore',
    'Tiruchirappalli',
  ],

  // International hubs (connect to major international cities)
  internationalHubs: ['Delhi', 'Mumbai', 'Bengaluru', 'Chennai'],
  internationalCities: [
    // Middle East
    'Dubai',
    'Abu Dhabi',
    'Doha',
    'Kuwait City',
    'Manama',
    'Riyadh',
    'Jeddah',
    'Dammam',
    // Southeast Asia
    'Singapore',
    'Kuala Lumpur',
    'Bangkok',
    'Phuket',
    'Hong Kong',
    'Jakarta',
    'Manila',
    'Ho Chi Minh City',
    'Colombo',
    // East Asia
    'Tokyo',
    'Seoul',
    // Europe
    'London',
    'Paris',
    'Frankfurt',
    'Munich',
    'Amsterdam',
    'Rome',
    'Milan',
    'Zurich',
    'Madrid',
    'Barcelona',
    'Vienna',
    'Copenhagen',
    'Stockholm',
    // North America
    'New York',
    'San Francisco',
    'Los Angeles',
    'Chicago',
    'Washington D.C.',
    'Boston',
    'Dallas',
    'Seattle',
    'Toronto',
    'Vancouver',
    // Oceania
    'Sydney',
    'Melbourne',
    'Perth',
    'Auckland',
  ],

  // Priority routes - ensure these always exist
  priorityRoutes: [
    // Major domestic trunk routes
    { origin: 'Delhi', dest: 'Mumbai' },
    { origin: 'Delhi', dest: 'Bengaluru' },
    { origin: 'Delhi', dest: 'Chennai' },
    { origin: 'Delhi', dest: 'Kolkata' },
    { origin: 'Mumbai', dest: 'Bengaluru' },
    { origin: 'Mumbai', dest: 'Chennai' },
    { origin: 'Mumbai', dest: 'Kolkata' },
    { origin: 'Bengaluru', dest: 'Chennai' },
    { origin: 'Bengaluru', dest: 'Kolkata' },
    { origin: 'Chennai', dest: 'Kolkata' },
    // Major international routes from Delhi
    { origin: 'Delhi', dest: 'Dubai' },
    { origin: 'Delhi', dest: 'Bangkok' },
    { origin: 'Delhi', dest: 'Singapore' },
    { origin: 'Delhi', dest: 'Hong Kong' },
    { origin: 'Delhi', dest: 'London' },
    { origin: 'Delhi', dest: 'New York' },
    // Major international routes from Mumbai
    { origin: 'Mumbai', dest: 'Dubai' },
    { origin: 'Mumbai', dest: 'Bangkok' },
    { origin: 'Mumbai', dest: 'Singapore' },
    { origin: 'Mumbai', dest: 'London' },
    { origin: 'Mumbai', dest: 'New York' },
    // Major international routes from Bengaluru
    { origin: 'Bengaluru', dest: 'Singapore' },
    { origin: 'Bengaluru', dest: 'Dubai' },
    { origin: 'Bengaluru', dest: 'Bangkok' },
    // Major international routes from Chennai
    { origin: 'Chennai', dest: 'Singapore' },
    { origin: 'Chennai', dest: 'Dubai' },
    { origin: 'Chennai', dest: 'Bangkok' },
  ],
};

// Generate flights for domestic network
function generateDomesticFlights() {
  const flights = [];
  const domesticCities = [
    ...routeNetwork.domesticHubs,
    ...routeNetwork.domesticCities,
  ];

  // Connect each domestic city to at least 2-3 hubs
  for (const city of routeNetwork.domesticCities) {
    // Select 2-3 random hubs for this city
    const selectedHubs = routeNetwork.domesticHubs
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 2));

    for (const hub of selectedHubs) {
      if (city !== hub) {
        // Generate 2-3 flights per route
        const flightCount = 2 + Math.floor(Math.random() * 2);
        const departureTimes = ['06:00', '12:00', '18:00', '21:00'];

        for (let i = 0; i < flightCount; i++) {
          const departureTime =
            departureTimes[Math.floor(Math.random() * departureTimes.length)];

          const onwardFlight = generateFlight(city, hub, departureTime);
          if (onwardFlight) {
            flights.push(onwardFlight);

            // Generate return flight
            const returnFlight = generateReturnFlight(onwardFlight);
            if (returnFlight) {
              flights.push(returnFlight);
            }
          }
        }
      }
    }
  }

  // Connect hubs to each other (major trunk routes)
  for (let i = 0; i < routeNetwork.domesticHubs.length; i++) {
    for (let j = i + 1; j < routeNetwork.domesticHubs.length; j++) {
      const hub1 = routeNetwork.domesticHubs[i];
      const hub2 = routeNetwork.domesticHubs[j];

      // Generate 3-4 flights per hub-to-hub route
      const flightCount = 3 + Math.floor(Math.random() * 2);
      const departureTimes = ['06:00', '09:00', '12:00', '15:00', '18:00'];

      for (let k = 0; k < flightCount; k++) {
        const departureTime =
          departureTimes[Math.floor(Math.random() * departureTimes.length)];

        const onwardFlight = generateFlight(hub1, hub2, departureTime);
        if (onwardFlight) {
          flights.push(onwardFlight);

          // Generate return flight
          const returnFlight = generateReturnFlight(onwardFlight);
          if (returnFlight) {
            flights.push(returnFlight);
          }
        }
      }
    }
  }

  return flights;
}

// Generate flights for international network
function generateInternationalFlights() {
  const flights = [];
  const internationalCities = routeNetwork.internationalCities;

  // Connect each international city to at least 1-2 hubs
  for (const city of internationalCities) {
    // Select 1-2 random hubs for this city
    const selectedHubs = routeNetwork.internationalHubs
      .sort(() => Math.random() - 0.5)
      .slice(0, 1 + Math.floor(Math.random() * 2));

    for (const hub of selectedHubs) {
      // Generate 1-2 flights per route
      const flightCount = 1 + Math.floor(Math.random() * 2);
      const departureTimes = ['06:00', '12:00', '18:00', '23:00'];

      for (let i = 0; i < flightCount; i++) {
        const departureTime =
          departureTimes[Math.floor(Math.random() * departureTimes.length)];

        const onwardFlight = generateFlight(hub, city, departureTime);
        if (onwardFlight) {
          flights.push(onwardFlight);

          // Generate return flight
          const returnFlight = generateReturnFlight(onwardFlight, 4);
          if (returnFlight) {
            flights.push(returnFlight);
          }
        }
      }
    }
  }

  return flights;
}

// Generate priority routes
function generatePriorityRoutes() {
  const flights = [];
  const departureTimes = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

  for (const route of routeNetwork.priorityRoutes) {
    // Generate 2-3 flights per priority route
    const flightCount = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < flightCount; i++) {
      const departureTime =
        departureTimes[Math.floor(Math.random() * departureTimes.length)];

      const onwardFlight = generateFlight(route.origin, route.dest, departureTime);
      if (onwardFlight) {
        flights.push(onwardFlight);

        // Generate return flight
        const returnFlight = generateReturnFlight(onwardFlight, 3);
        if (returnFlight) {
          flights.push(returnFlight);
        }
      }
    }
  }

  return flights;
}

// Main function
console.log('🚀 Generating comprehensive flight network...\n');

// Generate priority routes first
console.log('⭐ Generating priority routes...');
const priorityFlights = generatePriorityRoutes();
console.log(`✓ Generated ${priorityFlights.length} priority route flights`);

// Generate domestic flights
console.log('📊 Generating domestic flights...');
const domesticFlights = generateDomesticFlights();
console.log(`✓ Generated ${domesticFlights.length} domestic flights`);

// Generate international flights
console.log('🌍 Generating international flights...');
const internationalFlights = generateInternationalFlights();
console.log(`✓ Generated ${internationalFlights.length} international flights`);

// Combine all flights
const allFlights = [...priorityFlights, ...domesticFlights, ...internationalFlights];

// Create new flights data structure
const newFlightsData = {
  flights: allFlights,
  metadata: {
    totalFlights: allFlights.length,
    totalRoutes: new Set(
      allFlights.map((f) => `${f.origin}-${f.destination}`)
    ).size,
    totalCities: new Set(
      allFlights.flatMap((f) => [f.originCity, f.destinationCity])
    ).size,
    generatedAt: new Date().toISOString(),
    networkType: 'comprehensive-hub-spoke',
  },
};

// Write to file
fs.writeFileSync(
  path.join(__dirname, '../flights.json'),
  JSON.stringify(newFlightsData, null, 2)
);

console.log('\n✅ Flight network generation complete!');
console.log(`📈 Total flights: ${allFlights.length}`);
console.log(`🛫 Total routes: ${newFlightsData.metadata.totalRoutes}`);
console.log(`🌆 Total cities: ${newFlightsData.metadata.totalCities}`);
console.log('\n📝 File saved: frontend/src/data/flights.json');

