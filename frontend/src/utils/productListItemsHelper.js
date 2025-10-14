/**
 * Product List Items Helper for Adobe Analytics
 * Generates productListItems array for confirmation page data layer
 */

/**
 * Generate productListItems array from booking data
 * @param {Object} bookingData - Complete booking data including flights, services, pricing
 * @returns {Array} productListItems - Array of product items for Adobe Analytics
 */
export const generateProductListItems = (bookingData) => {
  // Validate input
  if (!bookingData || !bookingData.selectedFlights || !bookingData.selectedFlights.onward || 
      !bookingData.travellerDetails || bookingData.travellerDetails.length === 0) {
    return [];
  }
  
  const {
    selectedFlights,
    selectedServices,
    travellerDetails,
    pricing,
    ancillaryServices,
    flightTotal,
    ancillaryTotal,
    totalAmount
  } = bookingData;

  const productListItems = [];
  
  // Helper function to determine sector type
  const getSectorType = (origin, destination) => {
    // For simplicity, checking if both are Indian airports (you can enhance this)
    const indianAirports = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'AMD', 'PNQ', 'GOI', 'COK'];
    const isOriginIndian = indianAirports.includes(origin);
    const isDestinationIndian = indianAirports.includes(destination);
    
    return (isOriginIndian && isDestinationIndian) ? 'domestic' : 'international';
  };

  // Helper function to get cabin class string
  const normalizeCabinClass = (cabinClass) => {
    if (!cabinClass) return 'economy';
    return cabinClass.toLowerCase().replace(/\s+/g, '_');
  };

  // Process Flight Tickets (Base Fare)
  const processFlightTickets = () => {
    const numPassengers = travellerDetails?.length || 1;
    const flights = [];
    
    if (selectedFlights?.onward) {
      flights.push({ flight: selectedFlights.onward, type: 'onward' });
    }
    
    if (selectedFlights?.return) {
      flights.push({ flight: selectedFlights.return, type: 'return' });
    }

    flights.forEach(({ flight, type }) => {
      const origin = flight.origin?.iata_code || flight.originCode;
      const destination = flight.destination?.iata_code || flight.destinationCode;
      const flightNum = flight.flightNumber || flight.number;
      const flightClass = normalizeCabinClass(flight.cabinClass);
      const sku = `${origin}-${destination}:${flightNum}:${flightClass}`;
      const sectorType = getSectorType(origin, destination);
      
      // Price per bound (total flight price divided by number of bounds)
      const pricePerBound = (flight.price?.amount || 0) * numPassengers;

      productListItems.push({
        lineItemId: "Base Fare",
        SKU: sku,
        quantity: 1,
        priceTotal: pricePerBound,
        _experience: {
          analytics: {
            customDimensions: {
              eVars: {
                eVar9: sectorType,
                eVar33: flightClass,
                eVar35: "Non-Ancillary Item",
                eVar93: flightClass,
                eVar97: `${origin}-${destination}`
              }
            }
          }
        }
      });
    });
  };

  // Process Insurance (if available)
  const processInsurance = () => {
    // Check if insurance was selected in ancillary services
    // This depends on your implementation - adjust as needed
    if (selectedServices?.insurance) {
      const insurancePrice = selectedServices.insurance.price || 0;
      const origin = selectedFlights?.onward?.origin?.iata_code || selectedFlights?.onward?.originCode;
      const destination = selectedFlights?.onward?.destination?.iata_code || selectedFlights?.onward?.destinationCode;
      const flightClass = normalizeCabinClass(selectedFlights?.onward?.cabinClass);
      const sectorType = getSectorType(origin, destination);
      const defaultSegmentVal = selectedFlights?.return ? 
        `${origin}-${destination}:${selectedFlights.return.origin?.iata_code || selectedFlights.return.originCode}-${selectedFlights.return.destination?.iata_code || selectedFlights.return.destinationCode}` :
        `${origin}-${destination}`;

      productListItems.push({
        lineItemId: "Insurance",
        SKU: "Insurance",
        quantity: 1,
        priceTotal: insurancePrice,
        _experience: {
          analytics: {
            customDimensions: {
              eVars: {
                eVar35: "Insurance",
                eVar33: flightClass,
                eVar97: defaultSegmentVal,
                eVar9: sectorType
              }
            }
          }
        }
      });
    }
  };

  // Process Ancillary Services
  const processAncillaryServices = () => {
    if (!selectedServices) return;

    const origin = selectedFlights?.onward?.origin?.iata_code || selectedFlights?.onward?.originCode;
    const destination = selectedFlights?.onward?.destination?.iata_code || selectedFlights?.onward?.destinationCode;
    const flightClass = normalizeCabinClass(selectedFlights?.onward?.cabinClass);
    const sectorType = getSectorType(origin, destination);
    const defaultSegmentVal = selectedFlights?.return ? 
      `${origin}-${destination}:${selectedFlights.return.origin?.iata_code || selectedFlights.return.originCode}-${selectedFlights.return.destination?.iata_code || selectedFlights.return.destinationCode}` :
      `${origin}-${destination}`;

    // Process Seats
    ['onward', 'return'].forEach((journey) => {
      if (!selectedServices[journey]) return;

      const journeyServices = selectedServices[journey];
      const flight = selectedFlights[journey];
      if (!flight) return;

      const segmentVal = `${flight.origin?.iata_code || flight.originCode}-${flight.destination?.iata_code || flight.destinationCode}`;

      // Seats
      if (journeyServices.seat) {
        journeyServices.seat.forEach((seat, index) => {
          if (seat) {
            // Calculate seat price
            const row = parseInt(seat);
            const seatType = seat.slice(-1);
            const isPremiumRow = row <= 5;
            const isWindowSeat = seatType === 'W';
            const seatPrice = (isPremiumRow || isWindowSeat) ? 500 : 100;

            productListItems.push({
              lineItemId: "AncillaryService",
              SKU: "SEAT",
              quantity: 1,
              priceTotal: seatPrice,
              _experience: {
                analytics: {
                  customDimensions: {
                    eVars: {
                      eVar35: "Seat Selection",
                      eVar33: flightClass,
                      eVar97: segmentVal,
                      eVar63: seat,
                      eVar9: sectorType
                    }
                  }
                }
              }
            });
          }
        });
      }

      // Meals
      if (journeyServices.meals) {
        journeyServices.meals.forEach((meal, index) => {
          if (meal) {
            productListItems.push({
              lineItemId: "AncillaryService",
              SKU: "MEAL",
              quantity: 1,
              priceTotal: 0, // Meals are free in your implementation
              _experience: {
                analytics: {
                  customDimensions: {
                    eVars: {
                      eVar35: "Meal Selection",
                      eVar33: flightClass,
                      eVar97: segmentVal,
                      eVar62: meal.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                      eVar9: sectorType
                    }
                  }
                }
              }
            });
          }
        });
      }

      // Baggage
      if (journeyServices.baggage) {
        journeyServices.baggage.forEach((baggage, index) => {
          if (baggage && baggage !== 'included') {
            const isInternational = getSectorType(
              flight.origin?.iata_code || flight.originCode,
              flight.destination?.iata_code || flight.destinationCode
            ) === 'international';
            
            let baggagePrice = 0;
            let baggageName = '';
            
            switch (baggage) {
              case 'extra':
                baggagePrice = isInternational ? 2000 : 1000;
                baggageName = 'Extra Baggage';
                break;
              case 'sports':
                baggagePrice = isInternational ? 2000 : 1000;
                baggageName = 'Sports Equipment';
                break;
              case 'musical':
                baggagePrice = isInternational ? 2000 : 1000;
                baggageName = 'Musical Instrument';
                break;
              default:
                baggagePrice = 0;
                baggageName = 'Baggage';
            }

            if (baggage === 'sports') {
              // Sports Equipment - separate SKU
              productListItems.push({
                lineItemId: "AncillaryService",
                SKU: "SPEQ",
                quantity: 1,
                priceTotal: baggagePrice,
                _experience: {
                  analytics: {
                    customDimensions: {
                      eVars: {
                        eVar35: "Sports Equipment",
                        eVar97: segmentVal,
                        eVar33: flightClass,
                        eVar9: sectorType,
                        eVar90: `INR|Sports Equipment`
                      }
                    }
                  }
                }
              });
            } else {
              // Regular Baggage
              productListItems.push({
                lineItemId: "AncillaryService",
                SKU: "BAGGAGE",
                quantity: 1,
                priceTotal: baggagePrice,
                _experience: {
                  analytics: {
                    customDimensions: {
                      eVars: {
                        eVar35: "Baggage",
                        eVar33: flightClass,
                        eVar97: segmentVal,
                        eVar122: baggageName,
                        eVar9: sectorType
                      }
                    }
                  }
                }
              });
            }
          }
        });
      }

      // Priority Boarding
      if (journeyServices.priorityBoarding) {
        journeyServices.priorityBoarding.forEach((priority, index) => {
          if (priority) {
            productListItems.push({
              lineItemId: "AncillaryService",
              SKU: "PRIO",
              quantity: 1,
              priceTotal: 500,
              _experience: {
                analytics: {
                  customDimensions: {
                    eVars: {
                      eVar35: "Priority Boarding",
                      eVar97: segmentVal,
                      eVar93: flightClass,
                      eVar33: flightClass,
                      eVar9: sectorType,
                      eVar90: 'INR|PRIO',
                      eVar172: 'Priority Boarding'
                    }
                  }
                }
              }
            });
          }
        });
      }

      // Lounge Access
      if (journeyServices.loungeAccess) {
        journeyServices.loungeAccess.forEach((lounge, index) => {
          if (lounge) {
            productListItems.push({
              lineItemId: "AncillaryService",
              SKU: "LOUNGE",
              quantity: 1,
              priceTotal: 1500,
              _experience: {
                analytics: {
                  customDimensions: {
                    eVars: {
                      eVar35: "Lounge Access",
                      eVar97: segmentVal,
                      eVar93: flightClass,
                      eVar33: flightClass,
                      eVar9: sectorType,
                      eVar90: 'INR|LOUNGE',
                      eVar172: 'Airport Lounge Access'
                    }
                  }
                }
              }
            });
          }
        });
      }
    });
  };

  // Process Taxes
  const processTaxes = () => {
    const origin = selectedFlights?.onward?.origin?.iata_code || selectedFlights?.onward?.originCode;
    const destination = selectedFlights?.onward?.destination?.iata_code || selectedFlights?.onward?.destinationCode;
    const flightClass = normalizeCabinClass(selectedFlights?.onward?.cabinClass);
    const sectorType = getSectorType(origin, destination);
    const defaultSegmentVal = selectedFlights?.return ? 
      `${origin}-${destination}:${selectedFlights.return.origin?.iata_code || selectedFlights.return.originCode}-${selectedFlights.return.destination?.iata_code || selectedFlights.return.destinationCode}` :
      `${origin}-${destination}`;

    // Calculate taxes (you can customize this based on your pricing structure)
    const taxAmount = pricing?.taxes || 0;

    productListItems.push({
      lineItemId: "Total Taxes",
      SKU: "Taxes",
      quantity: 1,
      priceTotal: taxAmount,
      _experience: {
        analytics: {
          customDimensions: {
            eVars: {
              eVar35: "Non-Ancillary Item",
              eVar33: flightClass,
              eVar97: defaultSegmentVal,
              eVar9: sectorType
            }
          }
        }
      }
    });
  };

  // Process Convenience Fee
  const processConvenienceFee = () => {
    const origin = selectedFlights?.onward?.origin?.iata_code || selectedFlights?.onward?.originCode;
    const destination = selectedFlights?.onward?.destination?.iata_code || selectedFlights?.onward?.destinationCode;
    const flightClass = normalizeCabinClass(selectedFlights?.onward?.cabinClass);
    const sectorType = getSectorType(origin, destination);
    const defaultSegmentVal = selectedFlights?.return ? 
      `${origin}-${destination}:${selectedFlights.return.origin?.iata_code || selectedFlights.return.originCode}-${selectedFlights.return.destination?.iata_code || selectedFlights.return.destinationCode}` :
      `${origin}-${destination}`;

    // Calculate convenience fee (you can customize this)
    const convenienceFee = pricing?.convenienceFee || 0;

    productListItems.push({
      lineItemId: "Convenience Fee",
      SKU: "Convenience Fee",
      quantity: 1,
      priceTotal: convenienceFee,
      _experience: {
        analytics: {
          customDimensions: {
            eVars: {
              eVar35: "Non-Ancillary Item",
              eVar33: flightClass,
              eVar97: defaultSegmentVal,
              eVar9: sectorType
            }
          }
        }
      }
    });
  };

  // Process Surcharge
  const processSurcharge = () => {
    const origin = selectedFlights?.onward?.origin?.iata_code || selectedFlights?.onward?.originCode;
    const destination = selectedFlights?.onward?.destination?.iata_code || selectedFlights?.onward?.destinationCode;
    const flightClass = normalizeCabinClass(selectedFlights?.onward?.cabinClass);
    const sectorType = getSectorType(origin, destination);
    const defaultSegmentVal = selectedFlights?.return ? 
      `${origin}-${destination}:${selectedFlights.return.origin?.iata_code || selectedFlights.return.originCode}-${selectedFlights.return.destination?.iata_code || selectedFlights.return.destinationCode}` :
      `${origin}-${destination}`;

    // Calculate surcharge (you can customize this)
    const surcharge = pricing?.surcharge || 0;

    productListItems.push({
      lineItemId: "Surcharge",
      SKU: "Surcharge",
      quantity: 1,
      priceTotal: surcharge,
      _experience: {
        analytics: {
          customDimensions: {
            eVars: {
              eVar35: "Non-Ancillary Item",
              eVar33: flightClass,
              eVar97: defaultSegmentVal,
              eVar9: sectorType
            }
          }
        }
      }
    });
  };

  // Execute all processors
  processFlightTickets();
  processInsurance();
  processAncillaryServices();
  processTaxes();
  processConvenienceFee();
  processSurcharge();

  return productListItems;
};

/**
 * Generate simplified product list items for testing
 * @param {Object} bookingData - Booking data
 * @returns {Array} Simplified product list for debugging
 */
export const generateSimplifiedProductList = (bookingData) => {
  const items = generateProductListItems(bookingData);
  return items.map(item => ({
    lineItemId: item.lineItemId,
    SKU: item.SKU,
    quantity: item.quantity,
    priceTotal: item.priceTotal
  }));
};

export default generateProductListItems;

