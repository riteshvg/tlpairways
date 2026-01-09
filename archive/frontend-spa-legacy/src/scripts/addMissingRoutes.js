/**
 * Script to add missing high-priority flight routes to TL Airways
 * Includes new airports and comprehensive route coverage
 */

const fs = require('fs');
const path = require('path');

// Read existing data
const airportsPath = path.join(__dirname, '../data/airports.json');
const flightRoutesPath = path.join(__dirname, '../data/flight_routes.json');

const airports = JSON.parse(fs.readFileSync(airportsPath, 'utf8'));
const flightRoutes = JSON.parse(fs.readFileSync(flightRoutesPath, 'utf8'));

// New airports to add
const newAirports = [
  // Middle East & Gulf
  {
    "iata_code": "DOH",
    "name": "Hamad International Airport",
    "city": "Doha",
    "country": "Qatar",
    "coordinates": { "latitude": 25.2731, "longitude": 51.6081 }
  },
  {
    "iata_code": "KWI",
    "name": "Kuwait International Airport",
    "city": "Kuwait City",
    "country": "Kuwait",
    "coordinates": { "latitude": 29.2267, "longitude": 47.9689 }
  },
  {
    "iata_code": "RUH",
    "name": "King Khalid International Airport",
    "city": "Riyadh",
    "country": "Saudi Arabia",
    "coordinates": { "latitude": 24.9578, "longitude": 46.6988 }
  },
  // Southeast Asia
  {
    "iata_code": "BKK",
    "name": "Suvarnabhumi Airport",
    "city": "Bangkok",
    "country": "Thailand",
    "coordinates": { "latitude": 13.6900, "longitude": 100.7501 }
  },
  {
    "iata_code": "CGK",
    "name": "Soekarno-Hatta International Airport",
    "city": "Jakarta",
    "country": "Indonesia",
    "coordinates": { "latitude": -6.1256, "longitude": 106.6558 }
  },
  {
    "iata_code": "MNL",
    "name": "Ninoy Aquino International Airport",
    "city": "Manila",
    "country": "Philippines",
    "coordinates": { "latitude": 14.5086, "longitude": 121.0196 }
  },
  // Europe
  {
    "iata_code": "FCO",
    "name": "Leonardo da Vinci International Airport",
    "city": "Rome",
    "country": "Italy",
    "coordinates": { "latitude": 41.8003, "longitude": 12.2389 }
  },
  {
    "iata_code": "ZUR",
    "name": "Zurich Airport",
    "city": "Zurich",
    "country": "Switzerland",
    "coordinates": { "latitude": 47.4647, "longitude": 8.5492 }
  },
  {
    "iata_code": "MAD",
    "name": "Adolfo Suárez Madrid-Barajas Airport",
    "city": "Madrid",
    "country": "Spain",
    "coordinates": { "latitude": 40.4839, "longitude": -3.5680 }
  },
  // South Asia
  {
    "iata_code": "CMB",
    "name": "Bandaranaike International Airport",
    "city": "Colombo",
    "country": "Sri Lanka",
    "coordinates": { "latitude": 7.1808, "longitude": 79.8842 }
  },
  // North America
  {
    "iata_code": "YVR",
    "name": "Vancouver International Airport",
    "city": "Vancouver",
    "country": "Canada",
    "coordinates": { "latitude": 49.1967, "longitude": -123.1815 }
  },
  // Indian Domestic
  {
    "iata_code": "PNQ",
    "name": "Pune Airport",
    "city": "Pune",
    "country": "India",
    "coordinates": { "latitude": 18.5821, "longitude": 73.9197 }
  },
  {
    "iata_code": "GOI",
    "name": "Dabolim Airport",
    "city": "Goa",
    "country": "India",
    "coordinates": { "latitude": 15.3808, "longitude": 73.8314 }
  },
  {
    "iata_code": "JAI",
    "name": "Jaipur International Airport",
    "city": "Jaipur",
    "country": "India",
    "coordinates": { "latitude": 26.8242, "longitude": 75.8012 }
  }
];

// Generic airline names (avoiding trademark issues)
const airlines = [
  { name: 'TL Airways', weight: 40 },      // Flagship carrier
  { name: 'AirCloud', weight: 25 },        // Instead of Air India
  { name: 'CloudGo', weight: 20 },         // Instead of IndiGo
  { name: 'CloudAir', weight: 10 },        // Instead of Vistara
  { name: 'CloudJet', weight: 5 }          // Instead of SpiceJet
];

// Priority routes to add
const priorityRoutes = [
  // Middle East & Gulf (High Business Demand)
  { from: 'BOM', to: 'DOH', category: 'middle_east', basePrice: 30000, duration: '4h 30m' },
  { from: 'DEL', to: 'DOH', category: 'middle_east', basePrice: 32000, duration: '5h 15m' },
  { from: 'BLR', to: 'DOH', category: 'middle_east', basePrice: 28000, duration: '4h 45m' },
  { from: 'BOM', to: 'KWI', category: 'middle_east', basePrice: 25000, duration: '4h 00m' },
  { from: 'DEL', to: 'RUH', category: 'middle_east', basePrice: 28000, duration: '4h 30m' },
  
  // Southeast Asia (High Tourist/Business Demand)
  { from: 'BOM', to: 'BKK', category: 'southeast_asia', basePrice: 22000, duration: '4h 15m' },
  { from: 'DEL', to: 'BKK', category: 'southeast_asia', basePrice: 24000, duration: '4h 45m' },
  { from: 'BLR', to: 'BKK', category: 'southeast_asia', basePrice: 20000, duration: '4h 00m' },
  { from: 'BOM', to: 'CGK', category: 'southeast_asia', basePrice: 25000, duration: '5h 30m' },
  { from: 'DEL', to: 'MNL', category: 'southeast_asia', basePrice: 26000, duration: '6h 15m' },
  
  // Europe Extensions
  { from: 'BOM', to: 'FCO', category: 'europe', basePrice: 45000, duration: '8h 30m' },
  { from: 'DEL', to: 'FCO', category: 'europe', basePrice: 47000, duration: '9h 00m' },
  { from: 'BOM', to: 'ZUR', category: 'europe', basePrice: 42000, duration: '8h 15m' },
  { from: 'DEL', to: 'MAD', category: 'europe', basePrice: 48000, duration: '9h 30m' },
  
  // South Asia (Very High Demand)
  { from: 'BOM', to: 'CMB', category: 'south_asia', basePrice: 18000, duration: '2h 30m' },
  { from: 'DEL', to: 'CMB', category: 'south_asia', basePrice: 20000, duration: '3h 15m' },
  { from: 'MAA', to: 'CMB', category: 'south_asia', basePrice: 16000, duration: '2h 00m' },
  
  // North America Extensions
  { from: 'BOM', to: 'YYZ', category: 'north_america', basePrice: 55000, duration: '14h 30m' },
  { from: 'DEL', to: 'YYZ', category: 'north_america', basePrice: 57000, duration: '15h 00m' },
  { from: 'BOM', to: 'YVR', category: 'north_america', basePrice: 52000, duration: '13h 45m' },
  
  // Domestic High-Demand
  { from: 'BOM', to: 'PNQ', category: 'domestic', basePrice: 8000, duration: '1h 15m' },
  { from: 'DEL', to: 'GOI', category: 'domestic', basePrice: 12000, duration: '2h 30m' },
  { from: 'BOM', to: 'GOI', category: 'domestic', basePrice: 10000, duration: '1h 45m' },
  { from: 'BLR', to: 'GOI', category: 'domestic', basePrice: 11000, duration: '2h 00m' },
  { from: 'DEL', to: 'JAI', category: 'domestic', basePrice: 9000, duration: '1h 30m' }
];

// Aircraft assignment based on route category
const aircraftByCategory = {
  'domestic': ['Boeing 737', 'Airbus A320'],
  'south_asia': ['Boeing 737-800', 'Airbus A320'],
  'southeast_asia': ['Boeing 737-800', 'Airbus A330'],
  'middle_east': ['Boeing 787', 'Airbus A330'],
  'europe': ['Boeing 787', 'Boeing 777'],
  'north_america': ['Boeing 777', 'Boeing 787-9']
};

// Cabin classes based on route category
const cabinClassesByCategory = {
  'domestic': ['economy', 'premium_economy'],
  'south_asia': ['economy', 'premium_economy', 'business'],
  'southeast_asia': ['economy', 'premium_economy', 'business'],
  'middle_east': ['economy', 'premium_economy', 'business', 'first'],
  'europe': ['economy', 'premium_economy', 'business', 'first'],
  'north_america': ['economy', 'premium_economy', 'business', 'first']
};

// Meal options based on route category
const mealOptionsByCategory = {
  'domestic': ['veg', 'nonveg'],
  'south_asia': ['veg', 'nonveg', 'special'],
  'southeast_asia': ['veg', 'nonveg', 'special'],
  'middle_east': ['veg', 'nonveg', 'special', 'halal'],
  'europe': ['veg', 'nonveg', 'special', 'continental'],
  'north_america': ['veg', 'nonveg', 'special', 'continental']
};

// Add new airports to airports.json
console.log('Adding new airports...');
let addedAirports = 0;
newAirports.forEach(airport => {
  if (!airports.find(a => a.iata_code === airport.iata_code)) {
    airports.push(airport);
    addedAirports++;
    console.log(`Added airport: ${airport.iata_code} - ${airport.city}, ${airport.country}`);
  }
});

// Write updated airports back
fs.writeFileSync(airportsPath, JSON.stringify(airports, null, 2));
console.log(`Added ${addedAirports} new airports`);

// Generate flight data for each route
function generateFlightData(route) {
  const [origin, destination] = [route.from, route.to];
  
  // Get airport data
  const originAirport = airports.find(a => a.iata_code === origin);
  const destAirport = airports.find(a => a.iata_code === destination);
  
  if (!originAirport || !destAirport) {
    console.log(`Skipping ${origin}-${destination} - airport data not found`);
    return null;
  }
  
  // Select airline based on weight
  const random = Math.random() * 100;
  let cumulativeWeight = 0;
  let selectedAirline = airlines[0].name;
  
  for (const airline of airlines) {
    cumulativeWeight += airline.weight;
    if (random <= cumulativeWeight) {
      selectedAirline = airline.name;
      break;
    }
  }
  
  // Get aircraft and cabin classes for this category
  const aircraftOptions = aircraftByCategory[route.category];
  const cabinClasses = cabinClassesByCategory[route.category];
  const mealOptions = mealOptionsByCategory[route.category];
  
  // Generate 4 flights per route
  const flights = [];
  const departureTimes = [6, 10, 14, 18]; // Morning, afternoon, evening, night
  
  for (let i = 0; i < 4; i++) {
    const departureHour = departureTimes[i];
    const priceVariation = 1 + (i * 0.15); // 15% price increase per flight
    const basePrice = Math.round(route.basePrice * priceVariation);
    
    flights.push({
      itineraryId: `${origin}-${destination}-${i + 1}`,
      flightNumber: `${selectedAirline.substring(0, 2).toUpperCase()}${1000 + Math.floor(Math.random() * 900)}`,
      airline: selectedAirline,
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
      arrivalTime: `2024-03-20T${(departureHour + Math.floor(Math.random() * 2) + 1).toString().padStart(2, '0')}:30:00`,
      duration: route.duration,
      price: {
        amount: basePrice,
        currency: 'INR'
      },
      aircraft: aircraftOptions[Math.floor(Math.random() * aircraftOptions.length)],
      availableSeats: 120 + Math.floor(Math.random() * 80),
      mealOptions: mealOptions,
      cabinClasses: cabinClasses
    });
  }
  
  return {
    onward: flights,
    return: [] // Will be populated separately
  };
}

// Add routes to the database
console.log('\nAdding priority routes...');
let addedRoutes = 0;

priorityRoutes.forEach(route => {
  const routeKey = `${route.from}-${route.to}`;
  const returnRouteKey = `${route.to}-${route.from}`;
  
  // Add onward route
  if (!flightRoutes.routes[routeKey]) {
    const routeData = generateFlightData(route);
    if (routeData) {
      flightRoutes.routes[routeKey] = routeData;
      addedRoutes++;
      console.log(`Added route: ${routeKey} (${route.category})`);
    }
  }
  
  // Add return route
  if (!flightRoutes.routes[returnRouteKey]) {
    const returnRoute = { ...route, from: route.to, to: route.from };
    const returnRouteData = generateFlightData(returnRoute);
    if (returnRouteData) {
      flightRoutes.routes[returnRouteKey] = returnRouteData;
      addedRoutes++;
      console.log(`Added route: ${returnRouteKey} (${route.category})`);
    }
  }
});

// Write updated routes back to file
fs.writeFileSync(flightRoutesPath, JSON.stringify(flightRoutes, null, 2));

console.log(`\n=== SUMMARY ===`);
console.log(`Added airports: ${addedAirports}`);
console.log(`Added routes: ${addedRoutes}`);
console.log(`Total routes in database: ${Object.keys(flightRoutes.routes).length}`);
console.log(`Total airports in database: ${airports.length}`);

// Generate route summary by category
console.log('\n=== ROUTES BY CATEGORY ===');
const routesByCategory = {};
Object.keys(flightRoutes.routes).forEach(route => {
  const [origin, destination] = route.split('-');
  // Find category for this route
  const routeInfo = priorityRoutes.find(r => 
    (r.from === origin && r.to === destination) || 
    (r.from === destination && r.to === origin)
  );
  if (routeInfo) {
    if (!routesByCategory[routeInfo.category]) {
      routesByCategory[routeInfo.category] = [];
    }
    routesByCategory[routeInfo.category].push(route);
  }
});

Object.keys(routesByCategory).forEach(category => {
  console.log(`\n${category.toUpperCase()}: ${routesByCategory[category].length} routes`);
  routesByCategory[category].forEach(route => {
    console.log(`  - ${route}`);
  });
});

console.log('\n✅ Successfully added missing high-priority routes!');
