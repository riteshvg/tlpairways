const fs = require('fs');
const path = require('path');

const flightsPath = path.join(__dirname, '../flights.json');
const airportsPath = path.join(__dirname, '../airports.json');

// Air India airport list (from user's dump)
const airIndiaAirports = [
  { code: "AMD", airport: "Ahmedabad", country: "India", priority: 3 },
  { code: "ATQ", airport: "Amritsar", country: "India", priority: 2 },
  { code: "GOI", airport: "Goa", country: "India", priority: 3 },
  { code: "JAI", airport: "Jaipur", country: "India", priority: 2 },
  { code: "COK", airport: "Kochi", country: "India", priority: 2 },
  { code: "PNQ", airport: "Pune", country: "India", priority: 3 },
  { code: "IXB", airport: "Bagdogra", country: "India", priority: 1 },
  { code: "BHO", airport: "Bhopal", country: "India", priority: 1 },
  { code: "BBI", airport: "Bhubaneswar", country: "India", priority: 1 },
  { code: "CJB", airport: "Coimbatore", country: "India", priority: 1 },
  { code: "LKO", airport: "Lucknow", country: "India", priority: 1 },
  { code: "NAG", airport: "Nagpur", country: "India", priority: 1 },
  { code: "TRV", airport: "Trivandrum", country: "India", priority: 2 },
  { code: "VNS", airport: "Varanasi", country: "India", priority: 1 },
  // Middle East
  { code: "AUH", airport: "Abu Dhabi", country: "UAE", priority: 2 },
  { code: "DOH", airport: "Doha", country: "Qatar", priority: 3 },
  { code: "MCT", airport: "Muscat", country: "Oman", priority: 2 },
  { code: "BAH", airport: "Bahrain", country: "Bahrain", priority: 1 },
  { code: "RUH", airport: "Riyadh", country: "Saudi Arabia", priority: 1 },
  { code: "JED", airport: "Jeddah", country: "Saudi Arabia", priority: 1 },
  // Southeast Asia
  { code: "BKK", airport: "Bangkok", country: "Thailand", priority: 3 },
  { code: "KUL", airport: "Kuala Lumpur", country: "Malaysia", priority: 3 },
  { code: "HKG", airport: "Hong Kong", country: "Hong Kong", priority: 3 },
  { code: "CGK", airport: "Jakarta", country: "Indonesia", priority: 2 },
  { code: "MNL", airport: "Manila", country: "Philippines", priority: 2 },
  { code: "SGN", airport: "Ho Chi Minh City", country: "Vietnam", priority: 2 },
  { code: "HKT", airport: "Phuket", country: "Thailand", priority: 2 },
  { code: "DPS", airport: "Bali", country: "Indonesia", priority: 3 },
  // East Asia
  { code: "PVG", airport: "Shanghai Pudong", country: "China", priority: 3 },
  { code: "PEK", airport: "Beijing", country: "China", priority: 3 },
  { code: "ICN", airport: "Seoul Incheon", country: "South Korea", priority: 3 },
  { code: "NRT", airport: "Tokyo Narita", country: "Japan", priority: 3 },
  { code: "TPE", airport: "Taipei", country: "Taiwan", priority: 2 },
  // Europe
  { code: "AMS", airport: "Amsterdam", country: "Netherlands", priority: 3 },
  { code: "FRA", airport: "Frankfurt", country: "Germany", priority: 3 },
  { code: "MUC", airport: "Munich", country: "Germany", priority: 2 },
  { code: "BCN", airport: "Barcelona", country: "Spain", priority: 3 },
  { code: "MAD", airport: "Madrid", country: "Spain", priority: 2 },
  { code: "FCO", airport: "Rome", country: "Italy", priority: 3 },
  { code: "MXP", airport: "Milan", country: "Italy", priority: 2 },
  { code: "ZRH", airport: "Zurich", country: "Switzerland", priority: 2 },
  { code: "BRU", airport: "Brussels", country: "Belgium", priority: 2 },
  { code: "DUB", airport: "Dublin", country: "Ireland", priority: 2 },
  // USA
  { code: "LAX", airport: "Los Angeles", country: "USA", priority: 3 },
  { code: "SFO", airport: "San Francisco", country: "USA", priority: 3 },
  { code: "ORD", airport: "Chicago", country: "USA", priority: 3 },
  { code: "EWR", airport: "Newark", country: "USA", priority: 3 },
  { code: "IAH", airport: "Houston", country: "USA", priority: 2 },
  { code: "BOS", airport: "Boston", country: "USA", priority: 2 },
  { code: "SEA", airport: "Seattle", country: "USA", priority: 2 },
  { code: "ATL", airport: "Atlanta", country: "USA", priority: 3 },
  { code: "MIA", airport: "Miami", country: "USA", priority: 2 },
  // Oceania
  { code: "MEL", airport: "Melbourne", country: "Australia", priority: 3 },
  { code: "PER", airport: "Perth", country: "Australia", priority: 2 },
  { code: "AKL", airport: "Auckland", country: "New Zealand", priority: 2 },
  // Islands
  { code: "MLE", airport: "Malé", country: "Maldives", priority: 2 },
  { code: "MRU", airport: "Mauritius", country: "Mauritius", priority: 2 },
  { code: "CMB", airport: "Colombo", country: "Sri Lanka", priority: 2 },
];

// Hub airports for routing
const HUB_AIRPORTS = {
  india: ['DEL', 'BOM', 'BLR'],
  middleEast: ['DXB', 'DOH'],
  southeastAsia: ['SIN', 'BKK'],
  eastAsia: ['HKG', 'ICN'],
  europe: ['LHR', 'CDG', 'FRA'],
  usa: ['JFK', 'LAX', 'ORD'],
  oceania: ['SYD', 'MEL']
};

// Read existing flights
const flightsData = JSON.parse(fs.readFileSync(flightsPath, 'utf-8'));
const existingFlights = flightsData.flights || [];

// Read airport details for coordinates
const airportsData = JSON.parse(fs.readFileSync(airportsPath, 'utf-8'));

// Helper to find airport details
const findAirportDetails = (code) => {
  for (const cityData of airportsData.airports) {
    const airport = cityData.airports.find(a => a.code === code);
    if (airport) {
      return {
        ...airport,
        city: cityData.city,
        country: cityData.country
      };
    }
  }
  return null;
};

// Helper to get appropriate hub based on airport region
const getHub = (airportCode, country) => {
  if (country === 'India') return 'DEL';
  if (['UAE', 'Qatar', 'Oman', 'Bahrain', 'Saudi Arabia', 'Kuwait'].includes(country)) return 'DXB';
  if (['Thailand', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Vietnam'].includes(country)) return 'SIN';
  if (['China', 'South Korea', 'Taiwan', 'Hong Kong'].includes(country)) return 'HKG';
  if (['Japan'].includes(country)) return 'NRT';
  if (['UK', 'France', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland'].includes(country)) return 'LHR';
  if (country === 'USA') return 'JFK';
  if (['Australia', 'New Zealand'].includes(country)) return 'SYD';
  return 'DEL'; // Default to Delhi
};

// Generate flight number
const generateFlightNumber = (origin, destination, index = 1) => {
  const routeCode = `${origin}${destination}`.substring(0, 4);
  const baseNumber = 2000 + (index * 100);
  return `TL${baseNumber}`;
};

// Calculate approximate distance (simplified)
const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return 1500; // Default
  
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
};

// Calculate price based on distance
const calculatePrice = (distance) => {
  // Base price per km
  const pricePerKm = 3;
  const basePrice = distance * pricePerKm;
  
  // Add random variation
  const variation = Math.floor(Math.random() * 1000) - 500;
  return Math.max(2000, basePrice + variation);
};

// Calculate realistic duration based on distance with proper flight operations
const calculateDuration = (distance) => {
  // Realistic cruising speeds and operations
  const TAXI_AND_OPERATIONS = 30; // minutes for taxi, takeoff, landing
  const CLIMB_DESCENT = 20; // minutes for climb to cruise and descent
  
  // Determine aircraft type and speed based on distance
  let cruiseSpeed;
  if (distance > 4000) {
    cruiseSpeed = 920; // Long-haul: Boeing 787, A350
  } else if (distance > 2000) {
    cruiseSpeed = 900; // Wide-body: Boeing 777, A330
  } else if (distance > 500) {
    cruiseSpeed = 850; // Narrow-body: Boeing 737, A320
  } else {
    cruiseSpeed = 600; // Regional: ATR, small jets
  }
  
  // Calculate cruise time
  const cruiseTimeHours = distance / cruiseSpeed;
  const cruiseTimeMinutes = cruiseTimeHours * 60;
  
  // Total time = cruise + ground operations + contingency
  const totalMinutes = Math.round(cruiseTimeMinutes + TAXI_AND_OPERATIONS + CLIMB_DESCENT + 5);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

// Generate flight
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
  const arrivalHour = baseHour + durationHours;
  const arrivalMinute = durationMinutes;
  const arrivalTime = `2024-03-25T${String(arrivalHour % 24).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}:00`;
  
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

// Main execution
console.log('🚀 Expanding Flight Network...\n');

const newFlights = [];
const existingRoutes = new Set();

// Track existing routes
existingFlights.forEach(f => {
  existingRoutes.add(`${f.origin.iata_code}-${f.destination.iata_code}`);
});

console.log(`📊 Current routes: ${existingRoutes.size}`);
console.log(`📊 Current flights: ${existingFlights.length}`);

// Process priority 3 airports first, then 2, then 1
[3, 2, 1].forEach(priorityLevel => {
  console.log(`\n✨ Processing Priority ${priorityLevel} Airports...`);
  
  const airportsToProcess = airIndiaAirports.filter(a => a.priority === priorityLevel);
  
  airportsToProcess.forEach(airport => {
    const airportCode = airport.code;
    const hub = getHub(airportCode, airport.country);
    
    // Check if any flight exists for this airport
    const hasAnyFlight = existingRoutes.has(`${airportCode}-${hub}`) || 
                          existingRoutes.has(`${hub}-${airportCode}`) ||
                          Array.from(existingRoutes).some(route => 
                            route.startsWith(airportCode + '-') || route.endsWith('-' + airportCode)
                          );
    
    if (!hasAnyFlight) {
      // Get airport details
      const airportDetails = findAirportDetails(airportCode);
      const hubDetails = findAirportDetails(hub);
      
      if (!airportDetails) {
        console.log(`  ⚠️  ${airportCode} (${airport.airport}) - Not in airports.json, skipping`);
        return;
      }
      
      if (!hubDetails) {
        console.log(`  ⚠️  Hub ${hub} not found, skipping ${airportCode}`);
        return;
      }
      
      // Generate outbound flight (hub to airport)
      const outbound = generateFlight(hub, airportCode, hubDetails, airportDetails, 1);
      newFlights.push(outbound);
      existingRoutes.add(`${hub}-${airportCode}`);
      
      // Generate return flight (airport to hub)
      const returnFlight = generateFlight(airportCode, hub, airportDetails, hubDetails, 1);
      newFlights.push(returnFlight);
      existingRoutes.add(`${airportCode}-${hub}`);
      
      console.log(`  ✅ ${hub} ↔ ${airportCode} (${airport.airport}, ${airport.country})`);
    } else {
      console.log(`  ⏭️  ${airportCode} (${airport.airport}) - Already has flights`);
    }
  });
});

// Combine and save
const allFlights = [...existingFlights, ...newFlights];
fs.writeFileSync(flightsPath, JSON.stringify({ flights: allFlights }, null, 2));

console.log(`\n✅ Flight network expansion complete!`);
console.log(`📊 New flights added: ${newFlights.length}`);
console.log(`📊 Total flights now: ${allFlights.length}`);
console.log(`📊 Total routes now: ${existingRoutes.size}`);
console.log(`\n💾 flights.json updated!`);
console.log(`\n⚠️  Next step: Run generateFlightRoutes.js to update flight_routes.json`);

