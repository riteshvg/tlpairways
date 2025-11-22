const fs = require('fs');
const path = require('path');

// Read the existing flights.json
const flightsPath = path.join(__dirname, '../../../frontend/src/data/flights.json');
const flightsData = JSON.parse(fs.readFileSync(flightsPath, 'utf8'));

// Cities that HYD should have flights to (major Indian cities)
const destinations = [
    { code: 'DEL', city: 'Delhi', distance: 1580, duration: 125, price: 6500 },           // ~2h 5m
    { code: 'BOM', city: 'Mumbai', distance: 620, duration: 85, price: 5800 },            // ~1h 25m  
    { code: 'CCU', city: 'Kolkata', distance: 1500, duration: 120, price: 7200 },        // ~2h
    { code: 'COK', city: 'Kochi', distance: 1220, duration: 105, price: 6800 },          // ~1h 45m
    { code: 'AMD', city: 'Ahmedabad', distance: 950, duration: 90, price: 5500 },        // ~1h 30m
    { code: 'PNQ', city: 'Pune', distance: 560, duration: 75, price: 5200 },             // ~1h 15m
    { code: 'GOI', city: 'Goa', distance: 585, duration: 80, price: 5400 },              // ~1h 20m
    { code: 'JAI', city: 'Jaipur', distance: 1450, duration: 115, price: 6900 },         // ~1h 55m
    { code: 'LKO', city: 'Lucknow', distance: 1350, duration: 110, price: 6700 },        // ~1h 50m
];

// Check existing HYD routes
const existingHydRoutes = flightsData.flights
    .filter(f => f.origin === 'HYD')
    .map(f => f.destination);

console.log('Existing HYD routes:', existingHydRoutes);

// Flight prefixes for TL Airways
const flightPrefixes = ['TX', 'TL', 'TW', 'TP'];
const aircraftTypes = ['A320neo', 'A321neo', 'Boeing 737-800', 'Boeing 737 MAX'];
const departureTimes = ['06:00', '09:30', '12:00', '15:30', '18:00', '20:30'];

// Generate flight number
function generateFlightNumber() {
    const prefix = flightPrefixes[Math.floor(Math.random() * flightPrefixes.length)];
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${number}`;
}

// Generate unique ID
function generateId() {
    return `flight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate arrival time
function calculateArrivalTime(departure, durationMinutes) {
    const [hours, minutes] = departure.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinutes = totalMinutes % 60;
    return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
}

// Format duration
function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

// New flights to add
const newFlights = [];

destinations.forEach(dest => {
    // Skip if route already exists
    if (existingHydRoutes.includes(dest.code)) {
        console.log(`Route HYD -> ${dest.code} already exists, skipping`);
        return;
    }

    // Add 2 flights for each direction (HYD -> destination and destination -> HYD)
    for (let i = 0; i < 2; i++) {
        const departureTime = departureTimes[Math.floor(Math.random() * departureTimes.length)];
        const arrivalTime = calculateArrivalTime(departureTime, dest.duration);
        const price = dest.price + Math.floor(Math.random() * 2000) - 1000; // +/- 1000 variation

        // HYD -> Destination
        newFlights.push({
            id: generateId(),
            flightNumber: generateFlightNumber(),
            origin: 'HYD',
            originCity: 'Hyderabad',
            destination: dest.code,
            destinationCity: dest.city,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            duration: formatDuration(dest.duration),
            durationMinutes: dest.duration,
            price: price,
            aircraftType: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
            stops: [],
            availableSeats: Math.floor(Math.random() * 20) + 5,
            cabinClass: ['Economy', 'Business', 'First'],
            mealOptions: ['Veg', 'Non-Veg', 'Vegan'],
            baggage: {
                checked: '23 kg',
                cabin: '7 kg'
            },
            distance: dest.distance
        });

        // Destination -> HYD (return flight)
        const returnDepartureTime = departureTimes[Math.floor(Math.random() * departureTimes.length)];
        const returnArrivalTime = calculateArrivalTime(returnDepartureTime, dest.duration);
        const returnPrice = dest.price + Math.floor(Math.random() * 2000) - 1000;

        newFlights.push({
            id: generateId(),
            flightNumber: generateFlightNumber(),
            origin: dest.code,
            originCity: dest.city,
            destination: 'HYD',
            destinationCity: 'Hyderabad',
            departureTime: returnDepartureTime,
            arrivalTime: returnArrivalTime,
            duration: formatDuration(dest.duration),
            durationMinutes: dest.duration,
            price: returnPrice,
            aircraftType: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
            stops: [],
            availableSeats: Math.floor(Math.random() * 20) + 5,
            cabinClass: ['Economy', 'Business', 'First'],
            mealOptions: ['Veg', 'Non-Veg', 'Vegan'],
            baggage: {
                checked: '23 kg',
                cabin: '7 kg'
            },
            distance: dest.distance
        });
    }
});

console.log(`\nAdding ${newFlights.length} new flights (${newFlights.length / 2} routes)`);

// Add new flights to the data
flightsData.flights.push(...newFlights);

// Write back to file
fs.writeFileSync(flightsPath, JSON.stringify(flightsData, null, 2));

console.log(`✅ Successfully added flights! Total flights now: ${flightsData.flights.length}`);
console.log('\nNew routes added from/to HYD:');
destinations.forEach(dest => {
    if (!existingHydRoutes.includes(dest.code)) {
        console.log(`  - HYD ↔ ${dest.code} (${dest.city})`);
    }
});
