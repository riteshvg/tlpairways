// Initialize the data layer
window.adobeDataLayer = window.adobeDataLayer || [];

// Helper function to push data to data layer
const pushToDataLayer = (data) => {
  // Clear previous data layer events
  window.adobeDataLayer = [];
  // Push new event
  window.adobeDataLayer.push(data);
};

// Common page info structure
const getPageInfo = (pageName, previousPageName = null) => ({
  pageInfo: {
    pageName,
    previousPageName,
    siteSection: 'Booking',
    server: window.location.hostname,
    pageType: 'booking',
    pageCategory: 'flight_booking',
    pageSubCategory: pageName.toLowerCase().replace(/\s+/g, '_')
  },
  attributes: {
    environment: process.env.NODE_ENV || 'development',
    pageType: 'booking',
    pageCategory: 'flight_booking',
    pageSubCategory: pageName.toLowerCase().replace(/\s+/g, '_')
  }
});

// Common flight info structure
const getFlightInfo = (flight) => {
  // Get the correct price based on cabin class
  let price;
  if (flight.prices && flight.cabinClass) {
    price = flight.prices[flight.cabinClass];
  } else if (typeof flight.price === 'object') {
    price = flight.price.amount;
  } else {
    price = flight.price;
  }

  return {
    id: flight.itineraryId || flight.flightNumber,
    name: `${flight.origin.iata_code} to ${flight.destination.iata_code} - ${flight.flightNumber}`,
    price: price,
    brand: flight.airline,
    category: flight.origin.country_code !== 'IN' || flight.destination.country_code !== 'IN' ? 'Flights/International' : 'Flights/Domestic',
    aircraft: flight.aircraft,
    cabinClass: flight.cabinClass || 'economy'
  };
};

// Analytics service methods
const analytics = {
  // Page View Events
  pageView: (pageName, previousPageName = null) => {
    pushToDataLayer({
      event: 'pageView',
      ...getPageInfo(pageName, previousPageName)
    });
  },

  // Search Events
  searchInitiated: (searchParams) => {
    pushToDataLayer({
      event: 'searchInitiated',
      ...getPageInfo('Flight Search'),
      search: {
        originAirport: searchParams.originCode,
        destinationAirport: searchParams.destinationCode,
        departureDate: searchParams.date,
        returnDate: searchParams.returnDate,
        tripType: searchParams.tripType,
        paymentType: searchParams.paymentType,
        passengerCount: {
          adult: searchParams.passengers,
          child: 0,
          infant: 0
        }
      }
    });
  },

  searchResultsDisplayed: (data) => {
    const { searchParams, results } = data;
    pushToDataLayer({
      event: 'searchResultsDisplayed',
      ...getPageInfo('Search Results', 'Flight Search'),
      search: {
        originAirport: searchParams.originCode,
        destinationAirport: searchParams.destinationCode,
        departureDate: searchParams.date,
        returnDate: searchParams.returnDate,
        tripType: searchParams.tripType,
        paymentType: searchParams.paymentType,
        passengerCount: {
          adult: searchParams.passengers,
          child: 0,
          infant: 0
        },
        resultsCount: results.total
      },
      ecommerce: {
        impressions: [
          ...(results.onward || []).map((flight, index) => ({
            ...getFlightInfo(flight),
            list: 'Onward Flights',
            position: index + 1
          })),
          ...(results.return || []).map((flight, index) => ({
            ...getFlightInfo(flight),
            list: 'Return Flights',
            position: index + 1
          }))
        ]
      }
    });
  },

  // Flight Selection Events
  flightSelected: (flight, journeyType, searchParams) => {
    pushToDataLayer({
      event: 'flightSelected',
      ...getPageInfo('Flight Selection', 'Search Results'),
      flight: {
        ...getFlightInfo(flight),
        journeyType,
        cabinClass: searchParams.cabinClass
      },
      search: {
        originAirport: searchParams.originCode,
        destinationAirport: searchParams.destinationCode,
        departureDate: searchParams.date,
        returnDate: searchParams.returnDate,
        tripType: searchParams.tripType
      }
    });
  },

  // Passenger Details Events
  passengerDetailsAdded: (passengerDetails, searchParams) => {
    pushToDataLayer({
      event: 'passengerDetailsAdded',
      ...getPageInfo('Passenger Details', 'Flight Selection'),
      passengerDetails,
      search: {
        originAirport: searchParams.originCode,
        destinationAirport: searchParams.destinationCode,
        departureDate: searchParams.date,
        returnDate: searchParams.returnDate,
        tripType: searchParams.tripType
      }
    });
  },

  // Ancillary Services Events
  ancillarySelected: (services, flight, journeyType) => {
    pushToDataLayer({
      event: 'ancillarySelected',
      ...getPageInfo('Ancillary Services', 'Passenger Details'),
      services,
      flight: getFlightInfo(flight),
      journeyType
    });
  },

  // Payment Events
  paymentInitiated: (paymentDetails, bookingSummary) => {
    pushToDataLayer({
      event: 'paymentInitiated',
      ...getPageInfo('Payment', 'Ancillary Services'),
      payment: paymentDetails,
      booking: bookingSummary
    });
  },

  paymentCompleted: (paymentDetails, bookingSummary) => {
    pushToDataLayer({
      event: 'paymentCompleted',
      ...getPageInfo('Payment Confirmation', 'Payment'),
      payment: paymentDetails,
      booking: bookingSummary
    });
  },

  // Booking Confirmation Events
  bookingConfirmed: (bookingDetails) => {
    const {
      flights,
      passengers,
      services,
      payment,
      totalPrice,
      pnr,
      tickets
    } = bookingDetails;

    // Calculate fee breakdown
    const baseFare = flights?.onward?.price?.amount + (flights?.return?.price?.amount || 0);
    const taxes = Math.round(baseFare * 0.05); // 5% tax
    const convenienceFee = Math.round(baseFare * 0.02); // 2% convenience fee
    const surcharge = Math.round(baseFare * 0.01); // 1% surcharge

    // Calculate ancillary services for each flight
    const calculateFlightAncillaries = (flight, journeyServices) => {
      const ancillaries = [];
      let total = 0;

      // Seat costs
      if (journeyServices?.seat) {
        journeyServices.seat.filter(Boolean).forEach(seat => {
          const seatPrice = calculateSeatPrice(seat);
          ancillaries.push({
            name: `Seat ${seat}`,
            price: seatPrice,
            quantity: 1
          });
          total += seatPrice;
        });
      }

      // Baggage costs
      if (journeyServices?.baggage) {
        journeyServices.baggage.filter(b => b && b !== 'included').forEach(baggage => {
          const isInternational = flight.origin.iata_code !== flight.destination.iata_code;
          const baggagePrice = isInternational ? 2000 : 1000;
          ancillaries.push({
            name: `Baggage ${baggage}`,
            price: baggagePrice,
            quantity: 1
          });
          total += baggagePrice;
        });
      }

      // Priority boarding costs
      if (journeyServices?.priorityBoarding) {
        journeyServices.priorityBoarding.filter(Boolean).forEach(() => {
          ancillaries.push({
            name: 'Priority Boarding',
            price: 500,
            quantity: 1
          });
          total += 500;
        });
      }

      // Lounge access costs
      if (journeyServices?.loungeAccess) {
        journeyServices.loungeAccess.filter(Boolean).forEach(() => {
          ancillaries.push({
            name: 'Lounge Access',
            price: 1500,
            quantity: 1
          });
          total += 1500;
        });
      }

      return { ancillaries, total };
    };

    // Calculate ancillaries for both flights
    const onwardAncillaries = calculateFlightAncillaries(flights.onward, services?.onward);
    const returnAncillaries = flights.return ? calculateFlightAncillaries(flights.return, services?.return) : { ancillaries: [], total: 0 };
    
    // Total ancillary fee
    const ancillaryFee = onwardAncillaries.total + returnAncillaries.total;

    pushToDataLayer({
      event: 'bookingConfirmation',
      page: {
        pageInfo: {
          pageName: 'Booking Confirmation',
          previousPageName: 'Payment',
          siteSection: 'Booking',
          server: window.location.hostname,
          pageType: 'confirmation',
          pageCategory: 'booking',
          pageSubCategory: 'confirmation'
        }
      },
      ecommerce: {
        purchase: {
          purchaseID: pnr,
          actionField: {
            id: pnr,
            revenue: totalPrice,
            tax: taxes,
            convenienceFee: convenienceFee,
            surcharge: surcharge,
            ancillaryFee: ancillaryFee,
            baseFare: baseFare,
            totalPrice: totalPrice,
            paymentBy: payment?.paymentMethod || 'cash',
            transactionId: payment?.transactionId || `TXN-${Date.now()}`,
            currencyCode: 'INR',
            pnr: pnr,
            sectorType: flights?.onward?.origin?.country_code !== 'IN' || flights?.onward?.destination?.country_code !== 'IN' ? 'International' : 'Domestic',
            paymentType: payment?.method || 'cash',
            cabinClass: flights?.onward?.cabinClass || 'economy'
          },
          products: [
            {
              name: `${flights?.onward?.origin?.iata_code || ''} to ${flights?.onward?.destination?.iata_code || ''}`,
              id: flights?.onward?.flightNumber,
              price: flights?.onward?.price?.amount || 0,
              brand: flights?.onward?.airline,
              category: 'Flights/Domestic',
              quantity: 1,
              ticketNumber: tickets?.onward,
              pnr: pnr,
              paymentType: payment?.method || 'cash',
              cabinClass: flights?.onward?.cabinClass || 'economy',
              ancillaryServices: onwardAncillaries.ancillaries
            },
            ...(flights?.return ? [{
              name: `${flights?.return?.origin?.iata_code || ''} to ${flights?.return?.destination?.iata_code || ''}`,
              id: flights?.return?.flightNumber,
              price: flights?.return?.price?.amount || 0,
              brand: flights?.return?.airline,
              category: 'Flights/Domestic',
              quantity: 1,
              ticketNumber: tickets?.return,
              pnr: pnr,
              paymentType: payment?.method || 'cash',
              cabinClass: flights?.return?.cabinClass || 'economy',
              ancillaryServices: returnAncillaries.ancillaries
            }] : [])
          ]
        }
      }
    });
  }
};

// Helper function to calculate seat price
const calculateSeatPrice = (seat) => {
  if (!seat) return 0;
  try {
    const row = parseInt(seat);
    const seatType = seat.slice(-1);
    const isPremiumRow = row <= 5;
    const isWindowSeat = seatType === 'W';
    return (isPremiumRow || isWindowSeat) ? 1500 : 100;
  } catch (error) {
    console.warn('Error calculating seat price:', error);
    return 0;
  }
};

// Helper function to calculate ancillary total
const calculateAncillaryTotal = (services, flights) => {
  let total = 0;
  
  ['onward', 'return'].forEach(journey => {
    if (services?.[journey]) {
      // Seat costs
      if (services[journey].seat) {
        services[journey].seat.forEach(seat => {
          if (seat) {
            const row = parseInt(seat);
            const seatType = seat.slice(-1);
            const isPremiumRow = row <= 5;
            const isWindowSeat = seatType === 'W';
            const seatPrice = (isPremiumRow || isWindowSeat) ? 500 : 100;
            total += seatPrice;
          }
        });
      }
      
      // Baggage cost
      if (services[journey].baggage) {
        services[journey].baggage.forEach(baggage => {
          if (baggage && baggage !== 'included') {
            const isInternational = journey === 'onward' ? 
              flights?.onward?.origin?.iata_code !== flights?.onward?.destination?.iata_code :
              flights?.return?.origin?.iata_code !== flights?.return?.destination?.iata_code;
            const baggagePrice = isInternational ? 2000 : 1000;
            total += baggagePrice;
          }
        });
      }
      
      // Priority boarding costs
      if (services[journey].priorityBoarding) {
        services[journey].priorityBoarding.forEach(priority => {
          if (priority) {
            total += 500;
          }
        });
      }
      
      // Lounge access costs
      if (services[journey].loungeAccess) {
        services[journey].loungeAccess.forEach(lounge => {
          if (lounge) {
            total += 1500;
          }
        });
      }
    }
  });
  
  return total;
};

export default analytics; 