const productListItems = [];
const products = adobeDataLayer.getState()?.eventData?.revenue?.products || [];
const surcharge =
  adobeDataLayer.getState()?.eventData?.paymentDetails.paymentCategories
    .surcharge;
const ancillaryFare =
  adobeDataLayer.getState()?.eventData?.paymentDetails.paymentCategories
    .ancillaryFare;
const baseFare =
  adobeDataLayer.getState()?.eventData?.paymentDetails.paymentCategories
    .baseFare;
const convenienceFee =
  adobeDataLayer.getState()?.eventData?.paymentDetails.paymentCategories
    .convenienceFee;
const taxes =
  adobeDataLayer.getState()?.eventData?.paymentDetails.paymentCategories.taxes;
const cabinClass = adobeDataLayer.getState()?.eventData?.booking.cabinClass;
const tripType = adobeDataLayer.getState()?.eventData?.booking.tripType;
const flightOrigin = adobeDataLayer.getState()?.eventData?.booking.origin;
const flightDestination =
  adobeDataLayer.getState()?.eventData?.booking.destination;
const haulType = adobeDataLayer.getState()?.eventData?.booking.haulType.overall;

products.forEach((item, index) => {
  const {
    productId,
    productName,
    category,
    subcategory,
    price,
    quantity,
    currency,
    origin,
    destination,
    departureDate,
    cabinClass,
    seatNumber,
    journey,
  } = item;

  //Check if category is flight and log the details
  if (category === 'flight') {
    productListItems.push({
      lineItemId: category,
      SKU: productName,
      quantity: quantity,
      priceTotal: price,
      _experience: {
        analytics: {
          customDimensions: {
            eVars: {
              eVar25: cabinClass,
              eVar34: tripType,
              eVar35: haulType,
            },
          },
        },
      },
    });
  }

  //Check if ancillary is selected and log the details
  if (category === 'ancillary' && productId == 'seat') {
    productListItems.push({
      lineItemId: 'ancillary services',
      SKU: productName,
      quantity: 1,
      priceTotal: price,
      _experience: {
        analytics: {
          customDimensions: {
            eVars: {
              eVar25: cabinClass,
              eVar34: tripType,
              eVar35: haulType,
            },
          },
        },
      },
    });
  }
});

//Add surcharge calculation to productListItems object
productListItems.push({
  lineItemId: 'surcharge',
  SKU: 'surcharge',
  quantity: 1,
  priceTotal: surcharge,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar25: cabinClass,
          eVar34: tripType,
          eVar35: haulType,
        },
      },
    },
  },
});

//Add taxes calculation to productListItems object
productListItems.push({
  lineItemId: 'total taxes',
  SKU: 'taxes',
  quantity: 1,
  priceTotal: taxes,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar25: cabinClass,
          eVar34: tripType,
          eVar35: haulType,
        },
      },
    },
  },
});

//Add ancillary calculation to productListItems object
productListItems.push({
  lineItemId: 'ancillary',
  SKU: 'ancillary',
  quantity: 1,
  priceTotal: ancillaryFare,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar25: cabinClass,
          eVar34: tripType,
          eVar35: haulType,
        },
      },
    },
  },
});

//Add convenience fee calculation to productListItems object
productListItems.push({
  lineItemId: 'convenience fee',
  SKU: 'convenience fee',
  quantity: 1,
  priceTotal: convenienceFee,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar25: cabinClass,
          eVar34: tripType,
          eVar35: haulType,
        },
      },
    },
  },
});

//Add base fare calculation to productListItems object
productListItems.push({
  lineItemId: 'base fare',
  SKU: 'base fare',
  quantity: 1,
  priceTotal: baseFare,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar25: cabinClass,
          eVar34: tripType,
          eVar35: haulType,
        },
      },
    },
  },
});

console.log(productListItems);
