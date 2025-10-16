const fs = require('fs');
const path = require('path');

const flightsPath = path.join(__dirname, '../flights.json');

// Read flights.json
const flightsData = JSON.parse(fs.readFileSync(flightsPath, 'utf-8'));
const flights = flightsData.flights || [];

console.log('📊 Current flights:', flights.length);

// Track existing routes
const existingRoutes = new Set();
flights.forEach(flight => {
  const routeKey = `${flight.origin.iata_code}-${flight.destination.iata_code}`;
  existingRoutes.add(routeKey);
});

console.log('🛫 Existing routes:', existingRoutes.size);

// Generate return flights
const newReturnFlights = [];
const missingRoutes = [];

flights.forEach(flight => {
  const returnRouteKey = `${flight.destination.iata_code}-${flight.origin.iata_code}`;
  
  // Check if return route already exists
  if (!existingRoutes.has(returnRouteKey)) {
    missingRoutes.push(returnRouteKey);
    
    // Generate return flight by swapping origin and destination
    const returnFlight = {
      itineraryId: returnRouteKey + '-1',
      flightNumber: generateReturnFlightNumber(flight.flightNumber),
      airline: flight.airline,
      origin: {
        iata_code: flight.destination.iata_code,
        city: flight.destination.city,
        airport: flight.destination.airport
      },
      destination: {
        iata_code: flight.origin.iata_code,
        city: flight.origin.city,
        airport: flight.origin.airport
      },
      departureTime: adjustReturnDepartureTime(flight.arrivalTime),
      arrivalTime: adjustReturnArrivalTime(flight.arrivalTime, flight.duration),
      duration: flight.duration,
      price: {
        amount: flight.price.amount + Math.floor(Math.random() * 500) - 250, // Slight price variation
        currency: flight.price.currency
      },
      aircraft: flight.aircraft,
      availableSeats: flight.availableSeats - Math.floor(Math.random() * 20), // Slight variation
      mealOptions: flight.mealOptions,
      cabinClasses: flight.cabinClasses // Same classes as onward flight
    };
    
    newReturnFlights.push(returnFlight);
    existingRoutes.add(returnRouteKey);
  }
});

console.log('🔄 Missing return routes found:', missingRoutes.length);
console.log('Missing routes:', missingRoutes.join(', '));

// Combine existing and new flights
const allFlights = [...flights, ...newReturnFlights];

// Save updated flights.json
fs.writeFileSync(flightsPath, JSON.stringify({ flights: allFlights }, null, 2));

console.log('✅ Generated', newReturnFlights.length, 'new return flights');
console.log('📊 Total flights now:', allFlights.length);
console.log('🛫 Total unique routes now:', existingRoutes.size);
console.log('\n💾 flights.json updated successfully!');

// Helper functions
function generateReturnFlightNumber(flightNumber) {
  // Extract number and increment by 100 for return flight
  const match = flightNumber.match(/([A-Z]+)(\d+)/);
  if (match) {
    const prefix = match[1];
    const number = parseInt(match[2]) + 100;
    return `${prefix}${number}`;
  }
  return flightNumber + 'R';
}

function adjustReturnDepartureTime(arrivalTime) {
  // Add 3-6 hours to arrival time for return departure
  const date = new Date(arrivalTime);
  const hoursToAdd = 3 + Math.floor(Math.random() * 4); // 3-6 hours
  date.setHours(date.getHours() + hoursToAdd);
  return date.toISOString().replace('.000Z', '');
}

function adjustReturnArrivalTime(departureTime, duration) {
  // Calculate arrival time based on duration only (no extra layover time)
  const date = new Date(departureTime);
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    // Add flight duration only (layover is already in departure time)
    date.setHours(date.getHours() + hours);
    date.setMinutes(date.getMinutes() + minutes);
  }
  return date.toISOString().replace('.000Z', '');
}

