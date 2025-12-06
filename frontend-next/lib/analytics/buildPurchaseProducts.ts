/**
 * Helper to build purchase event products array from booking data
 */

export function buildPurchaseProducts(
    onwardFlight: any,
    returnFlight: any,
    ancillaryServices: any,
    travellers: any[],
    query: any
) {
    const products: any[] = [];
    const numPassengers = travellers.length;

    // Add flight products
    if (onwardFlight) {
        products.push({
            productId: 'base fare',
            productName: `Flight ${onwardFlight.flightNumber}`,
            category: 'flight',
            subCategory: 'onward',
            price: onwardFlight.currentPrice * numPassengers,
            quantity: numPassengers,
            currency: 'INR',
            origin: onwardFlight.origin,
            destination: onwardFlight.destination,
            departureDate: query.date ? new Date(query.date as string).toISOString().split('T')[0] : null,
            cabinClass: query.cabinClass || 'economy',
            journeyType: 'onward'
        });
    }

    if (returnFlight) {
        products.push({
            productId: 'base fare',
            productName: `Flight ${returnFlight.flightNumber}`,
            category: 'flight',
            subCategory: 'return',
            price: returnFlight.currentPrice * numPassengers,
            quantity: numPassengers,
            currency: 'INR',
            origin: returnFlight.origin,
            destination: returnFlight.destination,
            departureDate: query.returnDate ? new Date(query.returnDate as string).toISOString().split('T')[0] : null,
            cabinClass: query.cabinClass || 'economy',
            journeyType: 'return'
        });
    }

    // Add ancillary products
    const BAGGAGE_PRICES: any = { 5: 1500, 10: 2800, 15: 4000, 20: 5000 };
    const SEAT_PRICES: any = { standard: 0, window: 500, aisle: 500, extra_legroom: 1000, preferred: 200 };
    const PRIORITY_BOARDING_PRICE = 500;
    const LOUNGE_ACCESS_PRICE = 1500;

    ['onward', 'return'].forEach(direction => {
        const services = ancillaryServices[direction];
        if (!services) return;

        travellers.forEach((traveller, index) => {
            const selection = services[index];
            if (!selection) return;

            // Seats
            if (selection.seatNumber) {
                products.push({
                    productId: 'seat',
                    productName: `Seat ${selection.seatNumber} - Passenger ${index + 1} - ${direction}`,
                    category: 'ancillary',
                    subCategory: 'seat',
                    price: selection.seatPrice || SEAT_PRICES[selection.seatType] || 0,
                    quantity: 1,
                    currency: 'INR',
                    passengerIndex: index + 1,
                    seatNumber: selection.seatNumber,
                    journeyType: direction
                });
            }

            // Baggage
            if (selection.baggage && selection.baggage > 0) {
                const baggageType = selection.baggageType || `${selection.baggage}kg`;
                products.push({
                    productId: 'baggage',
                    productName: `Baggage ${baggageType} - ${direction}`,
                    category: 'ancillary',
                    subCategory: 'baggage',
                    price: BAGGAGE_PRICES[selection.baggage] || 1000,
                    quantity: 1,
                    currency: 'INR',
                    baggageType: baggageType,
                    journey: direction
                });
            }

            // Priority Boarding
            if (selection.priorityBoarding) {
                products.push({
                    productId: 'priorityBoarding',
                    productName: `Priority Boarding - ${direction}`,
                    category: 'ancillary',
                    subCategory: 'priorityBoarding',
                    price: selection.priorityBoardingPrice || PRIORITY_BOARDING_PRICE,
                    quantity: 1,
                    currency: 'INR',
                    journey: direction
                });
            }

            // Lounge Access (if available in selection)
            if (selection.loungeAccess) {
                products.push({
                    productId: 'loungeAccess',
                    productName: `Lounge Access - ${direction}`,
                    category: 'ancillary',
                    subCategory: 'loungeAccess',
                    price: LOUNGE_ACCESS_PRICE,
                    quantity: 1,
                    currency: 'INR',
                    journey: direction
                });
            }
        });
    });

    return products;
}
