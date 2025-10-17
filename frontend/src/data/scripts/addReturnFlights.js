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

// Routes to add return flights for
const routesToAdd = [
  'BOM-DXB',  // Mumbai - Dubai
  'BLR-SIN',  // Bangalore - Singapore
  'MAA-BKK',  // Chennai - Bangkok
  'BOM-SIN',  // Mumbai - Singapore
  'DEL-DXB'   // Delhi - Dubai
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

const generateReturnFlight = (onwardFlight) => {
  const originAirport = airports.find(a => a.code === onwardFlight.origin.iata_code);
  const destAirport = airports.find(a => a.code === onwardFlight.destination.iata_code);
  
  if (!originAirport || !destAirport) {
    console.warn(`⚠️  Missing airport data for ${onwardFlight.origin.iata_code}-${onwardFlight.destination.iata_code}`);
    return null;
  }
  
  const distance = calculateDistance(originAirport.coordinates, destAirport.coordinates);
  const price = calculatePrice(distance);
  const duration = calculateDuration(distance);
  
  // Parse onward departure time
  const onwardDeparture = new Date(onwardFlight.departureTime);
  
  // Return flight departs 3-6 hours after onward arrival
  const hoursToAdd = 3 + Math.floor(Math.random() * 4);
  const returnDeparture = new Date(onwardDeparture.getTime() + (hoursToAdd * 60 * 60 * 1000));
  
  // Calculate return arrival time based on duration
  const durationMatch = duration.match(/(\d+)h (\d+)m/);
  const durationHours = durationMatch ? parseInt(durationMatch[1]) : 2;
  const durationMinutes = durationMatch ? parseInt(durationMatch[2]) : 0;
  
  const returnArrival = new Date(returnDeparture.getTime() + (durationHours * 60 + durationMinutes) * 60 * 1000);
  
  // Format times in local time
  const formatTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
  
  const flightNumber = onwardFlight.flightNumber.replace(/TL/, 'TL') + 'R';
  
  return {
    itineraryId: `${onwardFlight.destination.iata_code}-${onwardFlight.origin.iata_code}-1`,
    flightNumber: flightNumber,
    airline: "TL Airways",
    origin: {
      iata_code: onwardFlight.destination.iata_code,
      city: onwardFlight.destination.city,
      airport: onwardFlight.destination.airport
    },
    destination: {
      iata_code: onwardFlight.origin.iata_code,
      city: onwardFlight.origin.city,
      airport: onwardFlight.origin.airport
    },
    departureTime: formatTime(returnDeparture),
    arrivalTime: formatTime(returnArrival),
    duration: duration,
    price: {
      amount: price,
      currency: onwardFlight.price.currency
    },
    aircraft: distance > 3000 ? "Boeing 777" : distance > 1500 ? "Airbus A320" : "Boeing 737",
    availableSeats: onwardFlight.availableSeats,
    mealOptions: onwardFlight.mealOptions,
    cabinClasses: onwardFlight.cabinClasses
  };
};

console.log('🔄 Adding return flights for specified routes...\n');

const newFlights = [];
let addedCount = 0;

// Find onward flights for each route and create return flights
routesToAdd.forEach(route => {
  const [origin, destination] = route.split('-');
  
  // Find onward flights for this route
  const onwardFlights = flightsData.flights.filter(flight => 
    flight.origin.iata_code === origin && 
    flight.destination.iata_code === destination
  );
  
  console.log(`\n📍 Route: ${route}`);
  console.log(`   Found ${onwardFlights.length} onward flight(s)`);
  
  onwardFlights.forEach(onwardFlight => {
    // Check if return flight already exists
    const returnExists = flightsData.flights.some(flight =>
      flight.origin.iata_code === destination &&
      flight.destination.iata_code === origin &&
      flight.flightNumber === onwardFlight.flightNumber + 'R'
    );
    
    if (returnExists) {
      console.log(`   ⏭️  Return flight ${onwardFlight.flightNumber}R already exists, skipping`);
    } else {
      const returnFlight = generateReturnFlight(onwardFlight);
      if (returnFlight) {
        newFlights.push(returnFlight);
        addedCount++;
        console.log(`   ✅ Created return flight: ${returnFlight.flightNumber} (${returnFlight.origin.iata_code} → ${returnFlight.destination.iata_code})`);
        console.log(`      Departure: ${returnFlight.departureTime}`);
        console.log(`      Arrival: ${returnFlight.arrivalTime}`);
        console.log(`      Duration: ${returnFlight.duration}`);
      }
    }
  });
});

// Add new flights to the flights array
if (newFlights.length > 0) {
  flightsData.flights.push(...newFlights);
  
  // Save updated flights
  fs.writeFileSync(flightsPath, JSON.stringify(flightsData, null, 2));
  
  console.log(`\n✅ Successfully added ${addedCount} return flight(s)!`);
  console.log(`📊 Total flights now: ${flightsData.flights.length}`);
} else {
  console.log('\n⚠️  No new flights were added (all return flights already exist)');
}

console.log('\n💾 flights.json updated!');

