# AEP Testing Suite - Quick Start Guide

## 🎯 Overview

This guide will help you set up and run the AEP Web SDK testing suite that fires **genuine interact calls** with all required attributes.

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Frontend application running on `http://localhost:3002`

## 🚀 Setup (5 Minutes)

### Step 1: Install Cypress

From the project root:

```bash
npm run cypress:install
```

Or manually:

```bash
npm install --save-dev cypress @testing-library/cypress
```

### Step 2: Verify Installation

```bash
npx cypress verify
```

### Step 3: Start the Application

In a **separate terminal**, start the frontend:

```bash
cd frontend
npm run start
```

Wait for the app to be accessible at `http://localhost:3002`

## ▶️ Running Tests

### Option 1: Interactive Mode (Recommended for Development)

```bash
npm run test:e2e:open
```

This opens the Cypress Test Runner where you can:
- ✅ Select and run individual tests
- ✅ See tests execute in real browser
- ✅ Time-travel through test steps
- ✅ Inspect network calls
- ✅ Debug failures

### Option 2: Headless Mode (For CI/CD)

```bash
npm run test:e2e
```

Runs all tests in headless mode and generates:
- Video recordings (in `cypress/videos/`)
- Screenshots on failure (in `cypress/screenshots/`)

### Option 3: Run Specific Test Suites

**Booking Flow Tests Only**:
```bash
npm run test:booking
```

**Data Layer Tests Only**:
```bash
npm run test:datalayer
```

**Single Test File**:
```bash
npx cypress run --spec "cypress/e2e/booking-flow/complete-purchase.cy.js"
```

## 📊 What Gets Tested

### Complete Booking Flow Test
**File**: `cypress/e2e/booking-flow/complete-purchase.cy.js`

**Journey Tested**:
1. ✅ Homepage page view
2. ✅ Flight search (searchInitiated event)
3. ✅ Flight selection (searchProceedToTravellerDetails event)
4. ✅ Traveller details entry
5. ✅ Ancillary service selection (proceedToPayment event)
6. ✅ Payment completion
7. ✅ **Purchase event with ALL product list items**

**Validations**:
- ✅ All events fire with correct eventType
- ✅ Required fields present in each event
- ✅ Product list items include:
  - 2 flight products (onward + return)
  - Seat selection
  - Priority boarding
  - Lounge access
- ✅ PNR consistency across entire flow
- ✅ Haul type classification (short/long haul)
- ✅ Revenue data accuracy
- ✅ Adobe Edge Network calls succeed (200 OK)
- ✅ No PII leakage

### Page View Tests
**File**: `cypress/e2e/data-layer/page-views.cy.js`

**Pages Tested**:
- Homepage
- Search Results
- (More can be added)

**Validations**:
- ✅ Page name
- ✅ Page type
- ✅ Page URL
- ✅ Referrer
- ✅ User agent
- ✅ Screen resolution
- ✅ Viewport size

## 🔍 Viewing Test Results

### During Interactive Mode

1. Click on any test in the Test Runner
2. Watch it execute in the browser
3. See each step and assertion
4. View network calls in DevTools
5. Inspect Adobe Data Layer state

### After Headless Run

**Check Videos**:
```bash
open cypress/videos/
```

**Check Screenshots** (if tests failed):
```bash
open cypress/screenshots/
```

**View Console Logs**:
Check terminal output for captured Adobe events

## 📝 Understanding Test Output

### Successful Test Output

```
✅ Homepage page view validated successfully
✅ Search event validation passed
✅ Product list item (flight) validation passed
✅ Product list item (ancillary) validation passed
✅ Purchase event validation passed
✅ All Purchase Event Validations Passed!
✅ Adobe Edge Network Response: Success
```

### Failed Test Output

```
❌ Expected property "productId" to exist
=== Captured Adobe Events ===
{
  "event": "purchase",
  "eventData": {
    ...
  }
}
```

Failed tests will show:
- What assertion failed
- All captured Adobe events
- Screenshot of the page
- Video of the test run

## 🛠️ Customizing Tests

### Modify Search Parameters

Edit `cypress/e2e/booking-flow/complete-purchase.cy.js`:

```javascript
const searchParams = {
  origin: 'DEL',        // Change origin
  destination: 'BOM',   // Change destination
  tripType: 'oneway',   // Change to 'oneway' or 'roundtrip'
  cabinClass: 'economy',// Change cabin class
  adults: 1,            // Change passenger count
  departureDate: getDatePlusDays(30),
  returnDate: getDatePlusDays(37)
};
```

### Add New Assertions

```javascript
cy.waitForAdobeEvent('purchase').then((event) => {
  // Your custom validation
  expect(event.eventData.customField).to.equal('expectedValue');
});
```

### Test Different User Journeys

Create new test files in `cypress/e2e/booking-flow/`:

```javascript
describe('One-Way Economy Booking', () => {
  it('should complete one-way booking', () => {
    // Your test steps
  });
});
```

## 🔐 Environment Variables

Update `cypress.config.js` with your Adobe settings:

```javascript
env: {
  adobeOrgId: 'YOUR_ADOBE_ORG_ID@AdobeOrg',
  adobeDatastreamId: 'YOUR_DATASTREAM_ID',
  // ...
}
```

## 🐛 Troubleshooting

### Issue: "Cannot find module 'cypress'"

**Solution**:
```bash
npm run cypress:install
```

### Issue: Tests timing out

**Solution**: Increase timeout in test
```javascript
cy.waitForAdobeEvent('purchase', 20000); // 20 seconds
```

### Issue: Application not accessible

**Solution**: Ensure frontend is running
```bash
cd frontend
npm run start
```

Then verify: http://localhost:3002

### Issue: Adobe events not captured

**Solution**: Check that Adobe Data Layer is initialized
```javascript
cy.waitForAdobeDataLayer();
```

### Issue: Network calls not intercepted

**Solution**: Add interception before visiting page
```javascript
beforeEach(() => {
  cy.interceptAdobeEdgeCalls();
});
```

## 📈 Next Steps

### 1. Run Your First Test

```bash
npm run test:e2e:open
```

Select `complete-purchase.cy.js` and watch it run!

### 2. Review Results

Check that all validations pass:
- ✅ Purchase event fires
- ✅ All product list items present
- ✅ Required fields validated
- ✅ Adobe Edge call succeeds

### 3. Customize for Your Needs

- Add more test scenarios
- Test edge cases
- Add custom validations
- Integrate with CI/CD

### 4. Monitor Data Quality

Regularly run tests to ensure:
- Events fire correctly
- Required attributes present
- No data quality issues
- No PII leakage

## 📚 Additional Resources

- [Full Testing Strategy](./AEP_TESTING_STRATEGY.md)
- [Cypress README](../cypress/README.md)
- [Custom Commands Reference](../cypress/support/aep-commands.js)
- [Cypress Documentation](https://docs.cypress.io/)

## 🎯 Success Criteria

Your testing suite is working correctly when:

✅ Tests run without errors  
✅ All assertions pass  
✅ Adobe Edge Network calls return 200 OK  
✅ Purchase event contains all product list items  
✅ Required fields validated  
✅ PNR consistent across flow  
✅ No PII detected  

## 🤝 Need Help?

1. Check test output logs
2. View captured Adobe events
3. Review screenshots/videos
4. Check network calls in DevTools
5. Refer to documentation

Happy Testing! 🎉

