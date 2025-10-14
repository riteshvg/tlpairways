# Product List Items Implementation Guide

## Overview
This guide explains how to implement the `productListItems` attribute in the BookingConfirmation page for Adobe Analytics tracking, based on the reference implementation provided.

## Key Differences from Reference Code
1. **No DOM Traversal**: All data is available in React state/props
2. **No Session Storage**: Data flows through React Router location state
3. **Direct Data Access**: We have structured booking data objects instead of `digitalData`

## Implementation Steps

### Step 1: Import the Helper Function

Add this import at the top of `BookingConfirmation.js`:

```javascript
import { generateProductListItems } from '../utils/productListItemsHelper';
```

### Step 2: Locate the Purchase Event

Find the `useEffect` hook around **line 393** in `BookingConfirmation.js` where the purchase event is created.

### Step 3: Replace Products Array Building

**REMOVE** the old products array building code (lines ~560-676):

```javascript
// OLD CODE - REMOVE THIS
// Build products array for revenue tracking
const products = [];

// Add flight products
if (selectedFlights.onward) {
  products.push({
    productId: 'flight',
    productName: `Flight ${selectedFlights.onward.flightNumber}`,
    category: 'flight',
    subcategory: 'onward',
    price: (selectedFlights.onward.price?.amount || 0) * numPassengers,
    quantity: numPassengers,
    currency: 'INR',
    origin: selectedFlights.onward.origin?.iata_code,
    destination: selectedFlights.onward.destination?.iata_code,
    departureDate: selectedFlights.onward.departureTime ? new Date(selectedFlights.onward.departureTime).toISOString().split('T')[0] : null,
    cabinClass: selectedFlights.onward.cabinClass || 'economy'
  });
}
// ... more product building logic
```

**ADD** this new code instead:

```javascript
// NEW CODE - Generate Adobe Analytics product list items
const productListItems = generateProductListItems({
  selectedFlights,
  selectedServices,
  travellerDetails,
  pricing: {
    taxes: feeBreakdown.taxes || 0,
    convenienceFee: feeBreakdown.convenienceFee || 0,
    surcharge: feeBreakdown.surcharge || 0
  },
  ancillaryServices: selectedServices,
  flightTotal: feeBreakdown.baseFare,
  ancillaryTotal: feeBreakdown.ancillaryTotal,
  totalAmount: feeBreakdown.total
});

// Keep the old products array for backward compatibility (optional)
const products = productListItems.map(item => ({
  productId: item.SKU,
  productName: item.lineItemId,
  category: item.lineItemId === 'Base Fare' ? 'flight' : 
            item.lineItemId === 'Insurance' ? 'insurance' : 'ancillary',
  price: item.priceTotal,
  quantity: item.quantity,
  currency: 'INR'
}));
```

### Step 4: Update Purchase Event Object

Update the `purchaseEvent` object (around line 678) to include `productListItems`:

```javascript
// Set comprehensive Purchase event with all purchase parameters
const purchaseEvent = {
  event: 'purchase',
  eventData: {
    revenue: {
      transactionId: txnId,
      totalRevenue: feeBreakdown.total,
      currency: 'INR',
      products: products, // Legacy format
      productListItems: productListItems, // Adobe Analytics format with eVars
      bookingReference: bookingRef,
      paymentMethod: (paymentDetails?.method || 'credit card').replace(/_/g, ' ').replace(/-/g, ' '),
      paymentStatus: 'completed',
      timestamp: new Date().toISOString()
    },
    // ... rest remains the same
  }
};
```

### Step 5: Add Debug Logging (Optional)

Add this before pushing the purchase event to help with debugging:

```javascript
// Debug: Log product list items
console.log('📊 Product List Items Generated:', {
  totalItems: productListItems.length,
  items: productListItems,
  totalRevenue: productListItems.reduce((sum, item) => sum + item.priceTotal, 0),
  breakdown: {
    baseFare: productListItems.filter(i => i.lineItemId === 'Base Fare').reduce((s, i) => s + i.priceTotal, 0),
    ancillary: productListItems.filter(i => i.lineItemId === 'AncillaryService').reduce((s, i) => s + i.priceTotal, 0),
    taxes: productListItems.find(i => i.SKU === 'Taxes')?.priceTotal || 0,
    fees: productListItems.filter(i => i.SKU.includes('Fee') || i.SKU === 'Surcharge').reduce((s, i) => s + i.priceTotal, 0)
  }
});
```

## Product List Items Structure

The `productListItems` array contains objects matching Adobe Analytics requirements:

### Base Fare Item
```javascript
{
  lineItemId: "Base Fare",
  SKU: "DEL-BOM:TLP001:economy",
  quantity: 1,
  priceTotal: 12000,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar9: "domestic",           // Sector type
          eVar33: "economy",            // Cabin class
          eVar35: "Non-Ancillary Item", // Item category
          eVar93: "economy",            // Flight class
          eVar97: "DEL-BOM"             // Segment
        }
      }
    }
  }
}
```

### Seat Selection Item
```javascript
{
  lineItemId: "AncillaryService",
  SKU: "SEAT",
  quantity: 1,
  priceTotal: 500,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar35: "Seat Selection",
          eVar33: "economy",
          eVar97: "DEL-BOM",
          eVar63: "12A",           // Seat number
          eVar9: "domestic"
        }
      }
    }
  }
}
```

### Meal Selection Item
```javascript
{
  lineItemId: "AncillaryService",
  SKU: "MEAL",
  quantity: 1,
  priceTotal: 0,               // Free
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar35: "Meal Selection",
          eVar33: "economy",
          eVar97: "DEL-BOM",
          eVar62: "Vegetarian",   // Meal type
          eVar9: "domestic"
        }
      }
    }
  }
}
```

### Baggage Item
```javascript
{
  lineItemId: "AncillaryService",
  SKU: "BAGGAGE",
  quantity: 1,
  priceTotal: 1000,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar35: "Baggage",
          eVar33: "economy",
          eVar97: "DEL-BOM",
          eVar122: "Extra Baggage", // Baggage type
          eVar9: "domestic"
        }
      }
    }
  }
}
```

### Sports Equipment Item
```javascript
{
  lineItemId: "AncillaryService",
  SKU: "SPEQ",
  quantity: 1,
  priceTotal: 2000,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar35: "Sports Equipment",
          eVar97: "DEL-BOM",
          eVar33: "economy",
          eVar9: "international",
          eVar90: "INR|Sports Equipment"
        }
      }
    }
  }
}
```

### Priority Boarding Item
```javascript
{
  lineItemId: "AncillaryService",
  SKU: "PRIO",
  quantity: 1,
  priceTotal: 500,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar35: "Priority Boarding",
          eVar97: "DEL-BOM",
          eVar93: "economy",
          eVar33: "economy",
          eVar9: "domestic",
          eVar90: "INR|PRIO",
          eVar172: "Priority Boarding"
        }
      }
    }
  }
}
```

### Lounge Access Item
```javascript
{
  lineItemId: "AncillaryService",
  SKU: "LOUNGE",
  quantity: 1,
  priceTotal: 1500,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar35: "Lounge Access",
          eVar97: "DEL-BOM",
          eVar93: "economy",
          eVar33: "economy",
          eVar9: "domestic",
          eVar90: "INR|LOUNGE",
          eVar172: "Airport Lounge Access"
        }
      }
    }
  }
}
```

### Insurance Item
```javascript
{
  lineItemId: "Insurance",
  SKU: "Insurance",
  quantity: 1,
  priceTotal: 500,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar35: "Insurance",
          eVar33: "economy",
          eVar97: "DEL-BOM:BOM-DEL",
          eVar9: "domestic"
        }
      }
    }
  }
}
```

### Taxes Item
```javascript
{
  lineItemId: "Total Taxes",
  SKU: "Taxes",
  quantity: 1,
  priceTotal: 2400,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar35: "Non-Ancillary Item",
          eVar33: "economy",
          eVar97: "DEL-BOM:BOM-DEL",
          eVar9: "domestic"
        }
      }
    }
  }
}
```

### Convenience Fee Item
```javascript
{
  lineItemId: "Convenience Fee",
  SKU: "Convenience Fee",
  quantity: 1,
  priceTotal: 200,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar35: "Non-Ancillary Item",
          eVar33: "economy",
          eVar97: "DEL-BOM:BOM-DEL",
          eVar9: "domestic"
        }
      }
    }
  }
}
```

### Surcharge Item
```javascript
{
  lineItemId: "Surcharge",
  SKU: "Surcharge",
  quantity: 1,
  priceTotal: 300,
  _experience: {
    analytics: {
      customDimensions: {
        eVars: {
          eVar35: "Non-Ancillary Item",
          eVar33: "economy",
          eVar97: "DEL-BOM:BOM-DEL",
          eVar9: "domestic"
        }
      }
    }
  }
}
```

## eVar Mapping Reference

| eVar   | Description                  | Example Values                          |
|--------|------------------------------|-----------------------------------------|
| eVar9  | Sector Type                  | `domestic`, `international`             |
| eVar33 | Cabin Class                  | `economy`, `business`, `first`          |
| eVar35 | Service Category             | `Non-Ancillary Item`, `Seat Selection`, `Meal Selection`, `Baggage`, `Insurance` |
| eVar62 | Meal Type                    | `Vegetarian`, `Non Vegetarian`          |
| eVar63 | Seat Number                  | `12A`, `14W`                            |
| eVar90 | Currency & Service Type      | `INR|PRIO`, `INR|Sports Equipment`      |
| eVar93 | Flight Class                 | `economy`, `business`, `first`          |
| eVar97 | Flight Segment               | `DEL-BOM`, `DEL-BOM:BOM-DEL`            |
| eVar122| Baggage Service Name         | `Extra Baggage`, `Sports Equipment`     |
| eVar172| Priority Service Name        | `Priority Boarding`, `Airport Lounge Access` |

## Testing

### 1. Console Testing
After implementing, check the browser console for:
```javascript
window.adobeDataLayer
// Look for the purchase event with productListItems
```

### 2. Verify Product List Items
```javascript
const purchaseEvent = window.adobeDataLayer.find(e => e.event === 'purchase');
console.log('Product List Items:', purchaseEvent.eventData.revenue.productListItems);
```

### 3. Verify Total Revenue Matches
```javascript
const total = purchaseEvent.eventData.revenue.productListItems
  .reduce((sum, item) => sum + item.priceTotal, 0);
console.log('Product List Total:', total);
console.log('Expected Total:', purchaseEvent.eventData.revenue.totalRevenue);
console.log('Match:', total === purchaseEvent.eventData.revenue.totalRevenue);
```

## Example Output

For a round-trip booking with 2 passengers, seat selection, and baggage:

```javascript
productListItems: [
  { lineItemId: "Base Fare", SKU: "DEL-BOM:TLP001:economy", priceTotal: 12000 },
  { lineItemId: "Base Fare", SKU: "BOM-DEL:TLP002:economy", priceTotal: 11000 },
  { lineItemId: "AncillaryService", SKU: "SEAT", priceTotal: 500 },
  { lineItemId: "AncillaryService", SKU: "SEAT", priceTotal: 500 },
  { lineItemId: "AncillaryService", SKU: "SEAT", priceTotal: 100 },
  { lineItemId: "AncillaryService", SKU: "SEAT", priceTotal: 100 },
  { lineItemId: "AncillaryService", SKU: "MEAL", priceTotal: 0 },
  { lineItemId: "AncillaryService", SKU: "MEAL", priceTotal: 0 },
  { lineItemId: "AncillaryService", SKU: "BAGGAGE", priceTotal: 1000 },
  { lineItemId: "AncillaryService", SKU: "BAGGAGE", priceTotal: 1000 },
  { lineItemId: "Total Taxes", SKU: "Taxes", priceTotal: 4600 },
  { lineItemId: "Convenience Fee", SKU: "Convenience Fee", priceTotal: 200 },
  { lineItemId: "Surcharge", SKU: "Surcharge", priceTotal: 300 }
]
// Total: 31,300
```

## Customization

### Adding New Service Types

To add a new ancillary service type, edit `productListItemsHelper.js`:

```javascript
// In processAncillaryServices function, add:
if (journeyServices.newService) {
  journeyServices.newService.forEach((service, index) => {
    if (service) {
      productListItems.push({
        lineItemId: "AncillaryService",
        SKU: "NEWSERVICE",
        quantity: 1,
        priceTotal: 750,
        _experience: {
          analytics: {
            customDimensions: {
              eVars: {
                eVar35: "New Service",
                eVar33: flightClass,
                eVar97: segmentVal,
                eVar9: sectorType
              }
            }
          }
        }
      });
    }
  });
}
```

### Adjusting Sector Type Logic

Edit the `getSectorType` function in `productListItemsHelper.js`:

```javascript
const getSectorType = (origin, destination) => {
  // Add more sophisticated logic
  const indianAirports = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'AMD', 'PNQ', 'GOI', 'COK'];
  const isOriginIndian = indianAirports.includes(origin);
  const isDestinationIndian = indianAirports.includes(destination);
  
  return (isOriginIndian && isDestinationIndian) ? 'domestic' : 'international';
};
```

## Troubleshooting

### Issue: productListItems is empty
**Solution**: Check that `selectedFlights` and `selectedServices` are not null/undefined

### Issue: Some services missing
**Solution**: Verify the service exists in `selectedServices[journey]` object

### Issue: Wrong prices
**Solution**: Check the price calculation logic in helper function matches your pricing model

### Issue: eVars showing "undefined"
**Solution**: Ensure all flight data includes required fields (origin, destination, cabinClass)

## Next Steps

1. Switch to `enhancements` branch
2. Implement the changes in `BookingConfirmation.js`
3. Test with a complete booking flow
4. Verify in browser console
5. Test with Adobe Analytics debugger
6. Deploy to staging for QA testing

