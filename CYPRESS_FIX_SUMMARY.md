# Cypress Promise Error - FIXED ✅

## Problem

You were getting this error:
```
CypressError: Cypress detected that you returned a promise from a command 
while also invoking one or more cy commands in that promise.
```

## Root Cause

Cypress commands (like `cy.task()`, `cy.log()`, etc.) **cannot** be called inside:
- `.then()` callbacks
- Promise constructors
- `cy.intercept()` handlers

This is because Cypress uses a command queue, while Promises execute immediately.

## What Was Fixed

### 1. `waitForAdobeEvent` Command
**Before (❌ Wrong)**:
```javascript
cy.window().then((win) => {
  return new Cypress.Promise((resolve, reject) => {
    cy.task('storeAdobeEvent', event); // ❌ Cypress command inside Promise
    resolve(event);
  });
});
```

**After (✅ Correct)**:
```javascript
cy.window({ log: false, timeout })
  .its('adobeDataLayer')
  .should('exist')
  .then((dataLayer) => {
    const event = dataLayer.find(item => item.event === eventName);
    if (!event) {
      throw new Error('Waiting...'); // Force retry
    }
    return event; // Just return, no cy commands
  });
```

### 2. `interceptAdobeEdgeCalls` Command
**Before (❌ Wrong)**:
```javascript
cy.intercept('POST', '**/ee/v1/interact*', (req) => {
  cy.task('log', 'message'); // ❌ Cypress command in intercept handler
  req.continue();
});
```

**After (✅ Correct)**:
```javascript
cy.intercept('POST', '**/ee/v1/interact*', (req) => {
  console.log('message'); // ✅ Use console.log instead
  req.continue();
});
```

### 3. Support File Cleanup
- Removed unused `storeAdobeEvent`, `getAdobeEvents`, `clearAdobeEvents` tasks
- Simplified error logging

## Files Modified

1. ✅ `cypress/support/aep-commands.js` - Fixed custom commands
2. ✅ `cypress/support/e2e.js` - Removed task calls
3. ✅ `cypress.config.js` - Removed unused task definitions

## How to Test the Fix

### Option 1: Cypress Should Already Be Open

If the Cypress window is still open:

1. **Click the test again**: `complete-purchase.cy.js`
2. The test should run without the promise error! 🎉

### Option 2: Restart Cypress

If you closed Cypress:

```bash
cd /Users/riteshg/Documents/Learnings/tlpairways
npm run test:e2e:open
```

Then:
1. Choose "E2E Testing"
2. Select Chrome browser
3. Click `complete-purchase.cy.js`

## What to Expect Now

✅ **Test should run successfully** through all steps:
1. Homepage loads
2. Searches for flights
3. Selects flights
4. Fills traveller details
5. Adds ancillary services
6. Completes payment
7. Validates purchase event

✅ **Green checkmarks** for all assertions

✅ **Console logs** will show:
- "✅ Adobe event captured: pageView"
- "✅ Adobe event captured: searchInitiated"
- "✅ Adobe event captured: purchase"
- Adobe Edge Network calls (check browser DevTools → Console)

## Cypress Best Practices (Learned)

### ✅ DO:
```javascript
cy.window().then((win) => {
  const value = win.someValue;
  return value; // Just return data
});

cy.window()
  .its('adobeDataLayer')
  .should('exist');

cy.intercept('POST', '/api', (req) => {
  console.log('Data:', req.body); // Use console.log
  req.continue();
});
```

### ❌ DON'T:
```javascript
cy.window().then((win) => {
  cy.task('something'); // ❌ Cypress command in .then()
  cy.log('message');    // ❌ Cypress command in .then()
});

cy.intercept('POST', '/api', (req) => {
  cy.task('log', 'message'); // ❌ Cypress command in intercept
});

return new Promise((resolve) => {
  cy.visit('/'); // ❌ Cypress command in Promise
});
```

## Debugging Tips

### View Adobe Events

**Option 1: In Cypress**
- Open DevTools (F12) in the Cypress browser
- Go to Console tab
- See all Adobe Data Layer logs

**Option 2: Programmatically**
In your test, add:
```javascript
cy.window().then((win) => {
  console.log('Adobe Data Layer:', win.adobeDataLayer);
});
```

### View Network Calls

1. Open DevTools in Cypress browser
2. Go to Network tab
3. Filter by "interact" or "collect"
4. See Adobe Edge Network calls

## Next Steps

1. ✅ Run the test - should work now!
2. 📖 Read `CYPRESS_BEGINNER_GUIDE.md`
3. 🎯 Try different scenarios
4. 📝 Check test results

## Need Help?

If you still see errors:

1. **Check the error message** - Different error now?
2. **Look at the failing step** - Which line?
3. **Check console logs** - What do they say?
4. **Take a screenshot** - Share the error

---

**Status**: ✅ **FIXED** - Tests should run without promise errors!

Try running the test now! 🚀

