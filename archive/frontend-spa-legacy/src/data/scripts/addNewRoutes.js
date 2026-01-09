const fs = require('fs');
const path = require('path');

const flightsPath = path.join(__dirname, '../flights.json');
const airportsPath = path.join(__dirname, '../airports.json');

// Read existing data
const flightsData = JSON.parse(fs.readFileSync(flightsPath, 'utf8'));
const airportsData = JSON.parse(fs.readFileSync(airportsPath, 'utf8'));

const airports = airportsData.airports.flatMap(country => 
  country.airports.map(airport => ({
    ...airport,
    city: country.city,
    country: country.country
  }))
);

// New routes to add (both onward and return)
const newRoutes = [
  { origin: 'BOM', destination: 'DXB' },  // Mumbai - Dubai
  { origin: 'BLR', destination: 'SIN' },  // Bangalore - Singapore
  { origin: 'MAA', destination: 'BKK' },  // Chennai - Bangkok
  { origin: 'BOM', destination: 'SIN' },  // Mumbai - Singapore
  { origin: 'DEL', destination: 'DXB' }   // Delhi - Dubai
];

// Helper functions
const calculateDistance = (coord1, coord2) => {
  const R = 6371;
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

const calculatePrice = (distance) => {
  const basePrice = distance * 2.5;
  const variation = Math.floor(Math.random() * 1000) - 500;
  return Math.max(2000, basePrice + variation);
};

const generateFlightNumber = (origin, destination, index) => {
  const num = 100 + index;
  return `TL${num}`;
};

const generateFlight = (origin, destination, originDetails, destDetails, index = 1) => {
  const distance = calculateDistance(originDetails.coordinates, destDetails.coordinates);
  const price = calculatePrice(distance);
  const duration = calculateDuration(distance);
  const flightNumber = generateFlightNumber(origin, destination, index);
  
  // Calculate departure time (varying by index)
  const baseHour = 6 + (index * 3); // 6, 9, 12, 15, 18, 21
  const departureTime = `2024-03-25T${String(baseHour).padStart(2, '0')}:00:00`;
  
  // Calculate arrival time based on duration
  const durationMatch = duration.match(/(\d+)h (\d+)m/);
  const durationHours = durationMatch ? parseInt(durationMatch[1]) : 2;
  const durationMinutes = durationMatch ? parseInt(durationMatch[2]) : 0;
  
  // Create departure date object
  const departureDate = new Date(departureTime);
  
  // Add duration to departure time
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
    itineraryId: `${origin}-${destination}-${index}`,
    flightNumber,
    airline: "TL Airways",
    origin: {
      iata_code: origin,
      city: originDetails.city,
      airport: originDetails.name
    },
    destination: {
      iata_code: destination,
      city: destDetails.city,
      airport: destDetails.name
    },
    departureTime,
    arrivalTime,
    duration,
    price: {
      amount: price,
      currency: "INR"
    },
    aircraft: distance > 3000 ? "Boeing 777" : distance > 1500 ? "Airbus A320" : "Boeing 737",
    availableSeats: 150,
    mealOptions: ["veg", "nonveg"],
    cabinClasses: ["economy", "premium_economy", "business", "first"]
  };
};

console.log('🔄 Adding new international routes...\n');

const newFlights = [];
let addedCount = 0;

newRoutes.forEach(route => {
  const { origin, destination } = route;
  
  // Check if route already exists
  const routeExists = flightsData.flights.some(flight =>
    flight.origin.iata_code === origin && flight.destination.iata_code === destination
  );
  
  if (routeExists) {
    console.log(`⏭️  Route ${origin}-${destination} already exists, skipping`);
    return;
  }
  
  // Get airport details
  const originAirport = airports.find(a => a.code === origin);
  const destAirport = airports.find(a => a.code === destination);
  
  if (!originAirport) {
    console.warn(`⚠️  Origin airport ${origin} not found in airports.json`);
    return;
  }
  
  if (!destAirport) {
    console.warn(`⚠️  Destination airport ${destination} not found in airports.json`);
    return;
  }
  
  console.log(`\n📍 Adding route: ${origin} → ${destination}`);
  console.log(`   ${originAirport.city} → ${destAirport.city}`);
  
  // Generate 2-3 flights for each route
  const numFlights = 3;
  for (let i = 1; i <= numFlights; i++) {
    const flight = generateFlight(origin, destination, originAirport, destAirport, i);
    newFlights.push(flight);
    addedCount++;
    console.log(`   ✅ Created flight ${i}: ${flight.flightNumber}`);
    console.log(`      Departure: ${flight.departureTime}`);
    console.log(`      Arrival: ${flight.arrivalTime}`);
    console.log(`      Duration: ${flight.duration}`);
    console.log(`      Distance: ${calculateDistance(originAirport.coordinates, destAirport.coordinates)} km`);
  }
});

// Add new flights to the flights array
if (newFlights.length > 0) {
  flightsData.flights.push(...newFlights);
  
  // Save updated flights
  fs.writeFileSync(flightsPath, JSON.stringify(flightsData, null, 2));
  
  console.log(`\n✅ Successfully added ${addedCount} new flight(s)!`);
  console.log(`📊 Total flights now: ${flightsData.flights.length}`);
} else {
  console.log('\n⚠️  No new flights were added');
}

console.log('\n💾 flights.json updated!');


