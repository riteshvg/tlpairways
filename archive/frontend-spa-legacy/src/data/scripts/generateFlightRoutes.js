const fs = require('fs');
const path = require('path');

const flightsPath = path.join(__dirname, '../flights.json');
const outputPath = path.join(__dirname, '../flight_routes.json');

// Read flights.json
const flightsData = JSON.parse(fs.readFileSync(flightsPath, 'utf-8'));
const flights = flightsData.flights || flightsData;

// Helper to get route key
const getRouteKey = (origin, destination) => `${origin}-${destination}`;

// Build route map
const routeMap = {};

flights.forEach(flight => {
  const origin = flight.origin.iata_code;
  const destination = flight.destination.iata_code;
  const onwardKey = getRouteKey(origin, destination);
  const returnKey = getRouteKey(destination, origin);

  // Onward
  if (!routeMap[onwardKey]) routeMap[onwardKey] = { onward: [], return: [] };
  routeMap[onwardKey].onward.push(flight);

  // Return
  if (!routeMap[returnKey]) routeMap[returnKey] = { onward: [], return: [] };
  routeMap[returnKey].return.push(flight);
});

// Write to flight_routes.json
fs.writeFileSync(outputPath, JSON.stringify({ routes: routeMap }, null, 2));

console.log('flight_routes.json generated successfully!'); 