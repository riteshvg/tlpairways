const fs = require('fs');
const path = require('path');

// Read the flights.json
const flightsPath = path.join(__dirname, '../../../frontend/src/data/flights.json');
const flightsData = JSON.parse(fs.readFileSync(flightsPath, 'utf8'));

// Create a map of origin -> destinations
const routeMap = {};

flightsData.flights.forEach(flight => {
    const origin = flight.origin;
    const destination = flight.destination;

    if (!routeMap[origin]) {
        routeMap[origin] = {
            city: flight.originCity,
            destinations: new Set()
        };
    }

    routeMap[origin].destinations.add(`${destination} (${flight.destinationCity})`);
});

// Convert Sets to Arrays and sort
Object.keys(routeMap).forEach(origin => {
    routeMap[origin].destinations = Array.from(routeMap[origin].destinations).sort();
});

// Print summary
console.log('===== FLIGHT ROUTE SUMMARY =====\n');
console.log(`Total Origins: ${Object.keys(routeMap).length}`);
console.log(`Total Flights: ${flightsData.flights.length}\n`);

// Sort origins alphabetically
const sortedOrigins = Object.keys(routeMap).sort();

sortedOrigins.forEach(origin => {
    const info = routeMap[origin];
    console.log(`\n${origin} - ${info.city}`);
    console.log(`  Destinations (${info.destinations.length}):`);
    info.destinations.forEach(dest => {
        console.log(`    → ${dest}`);
    });
});

// Create a summary table
console.log('\n\n===== ROUTE COVERAGE TABLE =====\n');
console.log('Origin | City | # Destinations | Destinations');
console.log('-------|------|---------------|-------------');

sortedOrigins.forEach(origin => {
    const info = routeMap[origin];
    const destCodes = info.destinations.map(d => d.split(' ')[0]).join(', ');
    console.log(`${origin.padEnd(6)} | ${info.city.padEnd(20)} | ${String(info.destinations.length).padStart(14)} | ${destCodes}`);
});

// Top origins by destination count
console.log('\n\n===== TOP ORIGINS BY CONNECTIVITY =====\n');
const topOrigins = sortedOrigins
    .map(origin => ({
        code: origin,
        city: routeMap[origin].city,
        count: routeMap[origin].destinations.length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

topOrigins.forEach((item, index) => {
    console.log(`${index + 1}. ${item.code} (${item.city}) - ${item.count} destinations`);
});
