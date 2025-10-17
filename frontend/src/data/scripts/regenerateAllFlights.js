const fs = require('fs');
const path = require('path');

const flightsPath = path.join(__dirname, '../flights.json');
const airportsPath = path.join(__dirname, '../airports.json');

// Read existing data
const airportsData = JSON.parse(fs.readFileSync(airportsPath, 'utf8'));
const existingFlightsData = JSON.parse(fs.readFileSync(flightsPath, 'utf8'));

const airports = airportsData.airports.flatMap(country => 
  country.airports.map(airport => ({
    ...airport,
    city: country.city,
    country: country.country
  }))
);

// Helper functions
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in km
  const lat1 = coord1.latitude;
  const lon1 = coord1.longitude;
  const lat2 = coord2.latitude;
  const lon2 = coord2.longitude;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
};

const calculatePrice = (distance) => {
  const basePrice = distance * 2.5;
  const variation = Math.floor(Math.random() * 1000) - 500;
  return Math.max(2000, basePrice + variation);
};

const calculateDuration = (distance) => {
  const TAXI_AND_OPERATIONS = 30;
  const CLIMB_DESCENT = 20;
  
  let cruiseSpeed;
  if (distance > 4000) {
    cruiseSpeed = 920;
  } else if (distance > 2000) {
    cruiseSpeed = 900;
  } else if (distance > 500) {
    cruiseSpeed = 850;
  } else {
    cruiseSpeed = 600;
  }
  
  const cruiseTimeHours = distance / cruiseSpeed;
  const cruiseTimeMinutes = cruiseTimeHours * 60;
  const totalMinutes = Math.round(cruiseTimeMinutes + TAXI_AND_OPERATIONS + CLIMB_DESCENT + 5);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

const generateFlightNumber = (origin, destination, index) => {
  const num = 100 + index;
  return `TL${num}`;
};

// Regenerate a single flight with correct arrival time
const regenerateFlight = (flight, index) => {
  const originAirport = airports.find(a => a.code === flight.origin.iata_code);
  const destAirport = airports.find(a => a.code === flight.destination.iata_code);
  
  if (!originAirport || !destAirport) {
    console.warn(`⚠️  Missing airport data for ${flight.origin.iata_code}-${flight.destination.iata_code}`);
    return flight; // Return original if we can't calculate
  }
  
  const distance = calculateDistance(originAirport.coordinates, destAirport.coordinates);
  const price = calculatePrice(distance);
  const duration = calculateDuration(distance);
  
  // Parse existing departure time
  const departureDate = new Date(flight.departureTime);
  
  // Calculate new arrival time based on duration
  const durationMatch = duration.match(/(\d+)h (\d+)m/);
  const durationHours = durationMatch ? parseInt(durationMatch[1]) : 2;
  const durationMinutes = durationMatch ? parseInt(durationMatch[2]) : 0;
  
  const arrivalDate = new Date(departureDate.getTime() + (durationHours * 60 + durationMinutes) * 60 * 1000);
  
  // Format arrival time in local time (not UTC)
  const year = arrivalDate.getFullYear();
  const month = String(arrivalDate.getMonth() + 1).padStart(2, '0');
  const day = String(arrivalDate.getDate()).padStart(2, '0');
  const hours = String(arrivalDate.getHours()).padStart(2, '0');
  const minutes = String(arrivalDate.getMinutes()).padStart(2, '0');
  const seconds = String(arrivalDate.getSeconds()).padStart(2, '0');
  const arrivalTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  
  return {
    ...flight,
    duration,
    price: {
      amount: price,
      currency: flight.price?.currency || 'INR'
    },
    arrivalTime,
    aircraft: distance > 3000 ? "Boeing 777" : distance > 1500 ? "Airbus A320" : "Boeing 737"
  };
};

console.log('🔄 Regenerating all flights with correct arrival times...\n');

const regeneratedFlights = existingFlightsData.flights.map((flight, index) => {
  const regenerated = regenerateFlight(flight, index);
  
  // Log changes for verification
  if (flight.arrivalTime !== regenerated.arrivalTime) {
    console.log(`✓ ${flight.itineraryId}: ${flight.arrivalTime} → ${regenerated.arrivalTime}`);
  }
  
  return regenerated;
});

// Save updated flights
const updatedData = {
  flights: regeneratedFlights
};

fs.writeFileSync(flightsPath, JSON.stringify(updatedData, null, 2));

console.log(`\n✅ Successfully regenerated ${regeneratedFlights.length} flights!`);
console.log('💾 flights.json updated with correct arrival times!');

