/**
 * Script to add important flight routes to the database
 * This ensures key origin-destination pairs have flight options
 */

const fs = require('fs');
const path = require('path');

// Read existing flight routes
const flightRoutesPath = path.join(__dirname, '../data/flight_routes.json');
const flightRoutes = JSON.parse(fs.readFileSync(flightRoutesPath, 'utf8'));

// Important routes to add (based on real-world airline connections)
const importantRoutes = [
  // Indian to Middle East (high demand)
  'BOM-DXB', 'DXB-BOM',
  'DEL-DXB', 'DXB-DEL', 
  'BLR-DXB', 'DXB-BLR',
  'HYD-DXB', 'DXB-HYD',
  
  // Indian to Southeast Asia
  'BOM-SIN', 'SIN-BOM',
  'BLR-SIN', 'SIN-BLR',
  'HYD-SIN', 'SIN-HYD',
  'BOM-KUL', 'KUL-BOM',
  'DEL-KUL', 'KUL-DEL',
  
  // Indian to Europe (major hubs)
  'BOM-CDG', 'CDG-BOM',
  'BLR-CDG', 'CDG-BLR',
  'HYD-CDG', 'CDG-HYD',
  'BOM-FRA', 'FRA-BOM',
  'BLR-FRA', 'FRA-BLR',
  'BOM-AMS', 'AMS-BOM',
  'BLR-AMS', 'AMS-BLR',
  
  // Indian to North America
  'BOM-JFK', 'JFK-BOM',
  'BLR-JFK', 'JFK-BLR',
  'HYD-JFK', 'JFK-HYD',
  'BOM-SFO', 'SFO-BOM',
  'BLR-SFO', 'SFO-BLR',
  
  // Indian to Asia Pacific
  'BOM-HKG', 'HKG-BOM',
  'DEL-HKG', 'HKG-DEL',
  'BLR-HKG', 'HKG-BLR',
  'BOM-ICN', 'ICN-BOM',
  'DEL-ICN', 'ICN-DEL',
  'BOM-HND', 'HND-BOM',
  'DEL-HND', 'HND-DEL',
  
  // European hub connections
  'LHR-CDG', 'CDG-LHR',
  'LHR-FRA', 'FRA-LHR',
  'LHR-AMS', 'AMS-LHR',
  'LHR-MUC', 'MUC-LHR',
  
  // US hub connections
  'JFK-LAX', 'LAX-JFK',
  'JFK-SFO', 'SFO-JFK',
  'JFK-ORD', 'ORD-JFK',
  
  // Asia Pacific connections
  'SIN-HKG', 'HKG-SIN',
  'SIN-ICN', 'ICN-SIN',
  'SIN-HND', 'HND-SIN',
  'HKG-ICN', 'ICN-HKG',
  'HKG-HND', 'HND-HKG',
  
  // Additional Indian domestic routes
  'BOM-CCU', 'CCU-BOM',
  'BLR-CCU', 'CCU-BLR',
  'MAA-CCU', 'CCU-MAA',
  'BOM-COK', 'COK-BOM',
  'BLR-COK', 'COK-BLR',
  'BOM-AMD', 'AMD-BOM',
  'BLR-AMD', 'AMD-BLR',
];

// Generate flight data for each route
function generateFlightData(route) {
  const [origin, destination] = route.split('-');
  
  // Get airport names from airports.json
  const airports = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/airports.json'), 'utf8'));
  const originAirport = airports.find(a => a.iata_code === origin);
  const destAirport = airports.find(a => a.iata_code === destination);
  
  if (!originAirport || !destAirport) {
    console.log(`Skipping ${route} - airport data not found`);
    return null;
  }
  
  // Calculate base price based on distance and route type
  const isInternational = originAirport.country !== destAirport.country;
  const isLongHaul = ['LHR', 'JFK', 'CDG', 'FRA', 'SFO', 'LAX', 'SYD', 'ICN', 'HND'].includes(destination);
  const isMiddleEast = ['DXB', 'DOH', 'AUH'].includes(destination);
  
  let basePrice = 5000; // Base price in INR
  if (isInternational) {
    if (isLongHaul) basePrice = 45000;
    else if (isMiddleEast) basePrice = 25000;
    else basePrice = 15000;
  }
  
  // Generate 3-4 flights per route
  const flights = [];
  const airlines = ['TL Airways', 'Air India', 'IndiGo', 'SpiceJet', 'Vistara'];
  const aircraft = ['Boeing 737', 'Boeing 777', 'Airbus A320', 'Airbus A330', 'Boeing 787'];
  
  for (let i = 1; i <= 4; i++) {
    const departureHour = 6 + (i * 4); // 6, 10, 14, 18
    const duration = isInternational ? (isLongHaul ? '8h 30m' : '4h 15m') : '2h 15m';
    
    flights.push({
      itineraryId: `${route}-${i}`,
      flightNumber: `TL${1000 + Math.floor(Math.random() * 900)}`,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      origin: {
        iata_code: origin,
        city: originAirport.city,
        airport: originAirport.name
      },
      destination: {
        iata_code: destination,
        city: destAirport.city,
        airport: destAirport.name
      },
      departureTime: `2024-03-20T${departureHour.toString().padStart(2, '0')}:00:00`,
      arrivalTime: `2024-03-20T${(departureHour + (isInternational ? (isLongHaul ? 8 : 4) : 2)).toString().padStart(2, '0')}:30:00`,
      duration: duration,
      price: {
        amount: basePrice + (i * 2000), // Price variation
        currency: 'INR'
      },
      aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
      availableSeats: 120 + Math.floor(Math.random() * 80),
      mealOptions: isInternational ? ['veg', 'nonveg', 'special'] : ['veg', 'nonveg'],
      cabinClasses: isInternational ? 
        ['economy', 'premium_economy', 'business', 'first'] : 
        ['economy', 'premium_economy']
    });
  }
  
  return {
    onward: flights,
    return: [] // Will be populated separately
  };
}

// Add routes to the database
console.log('Adding important routes to flight database...');
let addedCount = 0;

importantRoutes.forEach(route => {
  if (!flightRoutes.routes[route]) {
    const routeData = generateFlightData(route);
    if (routeData) {
      flightRoutes.routes[route] = routeData;
      addedCount++;
      console.log(`Added route: ${route}`);
    }
  } else {
    console.log(`Route ${route} already exists`);
  }
});

// Write updated routes back to file
fs.writeFileSync(flightRoutesPath, JSON.stringify(flightRoutes, null, 2));
console.log(`\nSuccessfully added ${addedCount} new routes!`);
console.log(`Total routes in database: ${Object.keys(flightRoutes.routes).length}`);

// Generate summary
console.log('\n=== ROUTE SUMMARY ===');
const routes = Object.keys(flightRoutes.routes).sort();
console.log(`Total routes: ${routes.length}`);
console.log('\nRoutes by origin:');
const byOrigin = {};
routes.forEach(route => {
  const origin = route.split('-')[0];
  if (!byOrigin[origin]) byOrigin[origin] = [];
  byOrigin[origin].push(route.split('-')[1]);
});

Object.keys(byOrigin).sort().forEach(origin => {
  console.log(`${origin}: ${byOrigin[origin].join(', ')}`);
});
