const fs = require('fs');

console.log('Loading flight data...');
const data = JSON.parse(fs.readFileSync('/Users/riteshg/Documents/Learnings/tlpairways/frontend-next/data/flights.json', 'utf8'));

console.log(`Total flights in database: ${data.flights.length}`);

// Create a map of routes
const routes = new Map();

console.log('Analyzing routes...');
data.flights.forEach((flight, index) => {
    if (index % 1000 === 0) {
        process.stdout.write(`\rProcessed ${index} flights...`);
    }

    const route = `${flight.origin}-${flight.destination}`;

    if (!routes.has(route)) {
        routes.set(route, {
            origin: flight.origin,
            originCity: flight.originCity,
            destination: flight.destination,
            destinationCity: flight.destinationCity,
            flightCount: 0
        });
    }

    routes.get(route).flightCount++;
});

console.log(`\n\nFound ${routes.size} unique routes`);

// Check for return routes
console.log('Checking for return routes...');
const roundtripRoutes = [];
const onewayRoutes = [];

routes.forEach((info, route) => {
    const reverseRoute = `${info.destination}-${info.origin}`;
    const hasReturn = routes.has(reverseRoute);

    const routeInfo = {
        route: `${info.originCity} (${info.origin}) → ${info.destinationCity} (${info.destination})`,
        flights: info.flightCount,
        origin: info.origin,
        destination: info.destination,
        hasReturn
    };

    if (hasReturn) {
        roundtripRoutes.push(routeInfo);
    } else {
        onewayRoutes.push(routeInfo);
    }
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('FLIGHT ROUTES ANALYSIS');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`Total unique routes: ${routes.size}`);
console.log(`Roundtrip routes: ${roundtripRoutes.length / 2} city pairs`);
console.log(`One-way only routes: ${onewayRoutes.length}`);

// Get unique city pairs for roundtrip
const cityPairs = new Map();
roundtripRoutes.forEach(r => {
    const key = [r.origin, r.destination].sort().join('-');
    if (!cityPairs.has(key)) {
        cityPairs.set(key, {
            cities: [r.origin, r.destination],
            routes: []
        });
    }
    cityPairs.get(key).routes.push(r);
});

console.log('\n───────────────────────────────────────────────────────────────');
console.log(`ROUNDTRIP ROUTES (${cityPairs.size} city pairs)`);
console.log('───────────────────────────────────────────────────────────────');

const sortedPairs = Array.from(cityPairs.entries()).sort((a, b) => a[0].localeCompare(b[0]));

sortedPairs.forEach(([key, data]) => {
    const [code1, code2] = data.cities;
    const route1 = data.routes.find(r => r.origin === code1);
    const route2 = data.routes.find(r => r.origin === code2);

    if (route1 && route2) {
        console.log(`${code1} ⇄ ${code2}: ${route1.originCity} ⇄ ${route2.originCity} (${route1.flights} + ${route2.flights} flights)`);
    }
});

if (onewayRoutes.length > 0) {
    console.log('\n───────────────────────────────────────────────────────────────');
    console.log(`ONE-WAY ONLY ROUTES (${onewayRoutes.length})`);
    console.log('───────────────────────────────────────────────────────────────');

    onewayRoutes.sort((a, b) => a.route.localeCompare(b.route));
    onewayRoutes.forEach(r => {
        console.log(`${r.origin} → ${r.destination}: ${r.originCity} → ${r.destinationCity} (${r.flights} flights)`);
    });
}

console.log('\n═══════════════════════════════════════════════════════════════\n');

// Save detailed report to file
const report = {
    summary: {
        totalFlights: data.flights.length,
        totalRoutes: routes.size,
        roundtripCityPairs: cityPairs.size,
        onewayRoutes: onewayRoutes.length
    },
    roundtripRoutes: Array.from(cityPairs.entries()).map(([key, data]) => {
        const [code1, code2] = data.cities;
        const route1 = data.routes.find(r => r.origin === code1);
        const route2 = data.routes.find(r => r.origin === code2);
        return {
            cityPair: `${code1}-${code2}`,
            route1: route1 ? `${route1.originCity} (${route1.origin}) → ${route1.destinationCity} (${route1.destination})` : null,
            route2: route2 ? `${route2.originCity} (${route2.origin}) → ${route2.destinationCity} (${route2.destination})` : null,
            flights1: route1?.flights || 0,
            flights2: route2?.flights || 0
        };
    }),
    onewayRoutes: onewayRoutes.map(r => ({
        route: r.route,
        origin: r.origin,
        destination: r.destination,
        flights: r.flights
    }))
};

fs.writeFileSync('flight-routes-report.json', JSON.stringify(report, null, 2));
console.log('Detailed report saved to: flight-routes-report.json\n');
