/**
 * Helper to build comprehensive payment page tracking data
 */

export function buildAncillaryServicesBreakdown(
    ancillaryServices: any,
    travellers: any[],
    onwardFlight: any,
    returnFlight: any
) {
    const BAGGAGE_PRICES: any = { 5: 1500, 10: 2800, 15: 4000, 20: 5000 };
    const SEAT_PRICES: any = { standard: 0, window: 500, aisle: 500, extra_legroom: 1000 };
    const PRIORITY_BOARDING_PRICE = 500;
    const LOUNGE_ACCESS_PRICE = 1500;

    const servicesSelected: any = {};
    let totalAncillaryCost = 0;
    let totalServicesSelected = 0;
    let totalPaidServices = 0;
    let totalFreeServices = 0;
    const categoriesSelected = new Set<string>();

    travellers.forEach((traveller, index) => {
        const passengerKey = `passenger${index + 1}`;
        const passengerName = `${traveller.firstName} ${traveller.lastName}`;

        servicesSelected[passengerKey] = {
            passengerName,
            onward: buildFlightServices(ancillaryServices.onward?.[index], 'onward'),
            ...(returnFlight ? { return: buildFlightServices(ancillaryServices.return?.[index], 'return') } : {})
        };

        // Count totals
        const onwardCost = servicesSelected[passengerKey].onward.totalCost;
        const returnCost = servicesSelected[passengerKey].return?.totalCost || 0;
        totalAncillaryCost += onwardCost + returnCost;

        // Count services
        ['onward', 'return'].forEach(direction => {
            const services = servicesSelected[passengerKey][direction];
            if (!services) return;

            if (services.seats.cost > 0) { totalPaidServices++; categoriesSelected.add('seating'); totalServicesSelected++; }
            if (services.meals.details) { totalFreeServices++; categoriesSelected.add('dining'); totalServicesSelected++; }
            if (services.baggage.cost > 0) { totalPaidServices++; categoriesSelected.add('baggage'); totalServicesSelected++; }
            if (services.priorityBoarding.details) {
                if (services.priorityBoarding.cost > 0) totalPaidServices++;
                categoriesSelected.add('boarding');
                totalServicesSelected++;
            }
            if (services.loungeAccess.details) {
                if (services.loungeAccess.cost > 0) totalPaidServices++;
                categoriesSelected.add('lounge');
                totalServicesSelected++;
            }
        });
    });

    function buildFlightServices(selection: any, direction: string) {
        if (!selection) {
            return {
                seats: { details: null, cost: 0, currency: 'INR', type: 'paid' },
                meals: { details: null, cost: 0, currency: 'INR', type: 'free' },
                baggage: { details: null, cost: 0, currency: 'INR', type: 'free' },
                priorityBoarding: { details: false, cost: 0, currency: 'INR', type: 'paid' },
                loungeAccess: { details: false, cost: 0, currency: 'INR', type: 'paid' },
                totalCost: 0,
                currency: 'INR'
            };
        }

        const seatCost = selection.seatPrice || 0;
        const baggageCost = selection.baggage ? (BAGGAGE_PRICES[selection.baggage] || 0) : 0;
        const priorityCost = selection.priorityBoardingPrice || 0;
        const loungeCost = 0; // Not in current implementation, but keeping for structure

        return {
            seats: {
                details: selection.seatNumber || null,
                cost: seatCost,
                currency: 'INR',
                type: 'paid'
            },
            meals: {
                details: selection.meal || null,
                cost: 0,
                currency: 'INR',
                type: 'free'
            },
            baggage: {
                details: selection.baggage ? `${selection.baggage}kg` : null,
                cost: baggageCost,
                currency: 'INR',
                type: baggageCost > 0 ? 'paid' : 'free'
            },
            priorityBoarding: {
                details: selection.priorityBoarding || false,
                cost: priorityCost,
                currency: 'INR',
                type: 'paid'
            },
            loungeAccess: {
                details: false, // Not in current implementation
                cost: loungeCost,
                currency: 'INR',
                type: 'paid'
            },
            totalCost: seatCost + baggageCost + priorityCost + loungeCost,
            currency: 'INR'
        };
    }

    return {
        totalAncillaryCost,
        currency: 'INR',
        servicesSelected,
        summary: {
            totalServicesSelected,
            totalPaidServices,
            totalFreeServices,
            categoriesSelected: Array.from(categoriesSelected)
        }
    };
}
