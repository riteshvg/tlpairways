# AEP Web SDK Testing Suite

## 🎯 Purpose

This testing suite validates Adobe Experience Platform (AEP) Web SDK implementation, ensuring all events fire correctly with required attributes and genuine interact calls.

## 📁 Structure

```
cypress/
├── e2e/
│   ├── booking-flow/          # End-to-end booking tests
│   │   └── complete-purchase.cy.js
│   └── data-layer/            # Data layer specific tests
│       └── page-views.cy.js
├── fixtures/                   # Test data
├── support/
│   ├── e2e.js                 # Global setup
│   ├── commands.js            # General commands
│   └── aep-commands.js        # AEP-specific commands
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install --save-dev cypress @testing-library/cypress
```

### 2. Run Tests

**Interactive Mode** (with Cypress UI):
```bash
npm run test:e2e:open
```

**Headless Mode** (for CI/CD):
```bash
npm run test:e2e
```

**Specific Test File**:
```bash
npx cypress run --spec "cypress/e2e/booking-flow/complete-purchase.cy.js"
```

### 3. Start Application

Before running tests, start the frontend:
```bash
cd frontend
npm run start
```

## 🧪 Available Tests

### 1. Complete Booking Flow
**File**: `cypress/e2e/booking-flow/complete-purchase.cy.js`

**What it tests**:
- ✅ Full booking journey (search → selection → details → payment → confirmation)
- ✅ All Adobe Data Layer events
- ✅ Purchase event with complete product list items
- ✅ PNR consistency across flow
- ✅ Haul type classification
- ✅ Revenue data accuracy
- ✅ Adobe Edge Network calls

**Run**:
```bash
npx cypress run --spec "cypress/e2e/booking-flow/complete-purchase.cy.js"
```

### 2. Page View Events
**File**: `cypress/e2e/data-layer/page-views.cy.js`

**What it tests**:
- ✅ Page view events on all pages
- ✅ Required page data attributes
- ✅ User context
- ✅ Device information

## 🛠️ Custom Commands

### AEP-Specific Commands

#### `cy.waitForAdobeDataLayer()`
Waits for Adobe Data Layer to initialize.

```javascript
cy.waitForAdobeDataLayer();
```

#### `cy.waitForAdobeEvent(eventName, timeout)`
Waits for specific Adobe event to be pushed.

```javascript
cy.waitForAdobeEvent('purchase', 10000);
```

#### `cy.interceptAdobeEdgeCalls()`
Intercepts all Adobe Edge Network calls for validation.

```javascript
cy.interceptAdobeEdgeCalls();
cy.visit('/');
cy.waitForEdgeResponse();
```

#### `cy.validatePurchaseEvent(event)`
Validates complete purchase event structure.

```javascript
cy.waitForAdobeEvent('purchase').then((event) => {
  cy.validatePurchaseEvent(event);
});
```

#### `cy.validateProductListItem(item, category)`
Validates individual product list item.

```javascript
productListItems.forEach(item => {
  cy.validateProductListItem(item, 'flight');
});
```

#### `cy.checkForPII(data)`
Checks data for potential PII leakage.

```javascript
cy.checkForPII(eventData);
```

### General Commands

#### `cy.searchFlights(params)`
Performs flight search with parameters.

```javascript
cy.searchFlights({
  origin: 'BOM',
  destination: 'HYD',
  tripType: 'roundtrip',
  cabinClass: 'business',
  adults: 2
});
```

## ✅ Validation Checklist

Each test validates:

### Purchase Event
- [ ] Event type = 'purchase'
- [ ] Transaction ID exists
- [ ] Total revenue > 0
- [ ] Currency = 'INR'
- [ ] Product list items array populated
- [ ] Booking reference (PNR) exists and is 6 characters
- [ ] Payment status = 'completed'
- [ ] All product list items have required fields
- [ ] Haul type classification present
- [ ] Customer info present
- [ ] Booking details complete

### Product List Items
- [ ] Product ID
- [ ] Product Name
- [ ] Category (flight/ancillary)
- [ ] Price (number)
- [ ] Quantity (number)
- [ ] Currency
- [ ] Flight: origin, destination, departure date, cabin class
- [ ] Ancillary: subcategory, journey

### Page View Events
- [ ] Event type = 'pageView'
- [ ] Page name
- [ ] Page URL
- [ ] Page type
- [ ] Referrer
- [ ] User agent
- [ ] Screen resolution
- [ ] Viewport size

## 🔍 Debugging

### View Captured Events
Events are automatically captured and logged on test failure.

### Manual Event Inspection
```javascript
cy.task('getAdobeEvents').then(events => {
  console.log(events);
});
```

### Network Calls
All Adobe Edge Network calls are intercepted and logged.

### Screenshots
Automatic screenshots on failure are saved to:
```
cypress/screenshots/
```

### Videos
Test execution videos are saved to:
```
cypress/videos/
```

## 📊 Test Reports

### Generate HTML Report
```bash
npm run test:e2e:report
```

### View Results
Reports include:
- Total events captured
- Pass/fail status
- Event payload details
- Network call status
- Screenshots/videos

## 🔐 PII Compliance

Tests automatically check for:
- Email addresses
- Phone numbers
- Credit card numbers

Warnings are logged if potential PII is detected.

## 🎯 Best Practices

1. **Always intercept Adobe calls**
   ```javascript
   beforeEach(() => {
     cy.interceptAdobeEdgeCalls();
   });
   ```

2. **Wait for events explicitly**
   ```javascript
   cy.waitForAdobeEvent('purchase', 15000);
   ```

3. **Validate thoroughly**
   ```javascript
   cy.validatePurchaseEvent(event);
   cy.checkForPII(event);
   ```

4. **Clear state between tests**
   ```javascript
   beforeEach(() => {
     cy.clearAdobeDataLayer();
     cy.clearCookies();
     cy.clearLocalStorage();
   });
   ```

## 🚨 Common Issues

### Issue: Events not firing
**Solution**: Check that Adobe Data Layer is initialized
```javascript
cy.waitForAdobeDataLayer();
```

### Issue: Timeout waiting for event
**Solution**: Increase timeout or check event name
```javascript
cy.waitForAdobeEvent('purchase', 20000);
```

### Issue: Network calls not intercepted
**Solution**: Set up interception before visiting page
```javascript
cy.interceptAdobeEdgeCalls();
cy.visit('/');
```

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Adobe Experience Platform Web SDK](https://experienceleague.adobe.com/docs/experience-platform/edge/home.html)
- [XDM Schema Reference](https://experienceleague.adobe.com/docs/experience-platform/xdm/home.html)

## 🤝 Contributing

When adding new tests:
1. Follow existing test structure
2. Use custom commands
3. Add comprehensive validations
4. Document what's being tested
5. Include assertions for all required fields

