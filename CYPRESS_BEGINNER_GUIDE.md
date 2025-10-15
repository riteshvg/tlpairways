# Cypress for Beginners - Complete Guide

## 🎓 What is Cypress?

Cypress is a testing tool that:
- Opens a real browser (Chrome, Firefox, etc.)
- Visits your website automatically
- Clicks buttons, fills forms, and navigates like a real user
- Checks if everything works correctly
- Takes screenshots and videos

Think of it as a robot that tests your website for you!

## 🚀 Your First Test - Step by Step

### STEP 1: Start Your Application

**Before running tests, your website must be running!**

Open a **NEW terminal window** (keep it separate) and run:

```bash
cd /Users/riteshg/Documents/Learnings/tlpairways/frontend
npm run start
```

Wait until you see:
```
webpack compiled successfully
```

Your app is now running at: **http://localhost:3002**

✅ Keep this terminal window open while testing!

---

### STEP 2: Open Cypress (Interactive Mode)

In your **original terminal**, run:

```bash
cd /Users/riteshg/Documents/Learnings/tlpairways
npm run test:e2e:open
```

**What happens:**
- A Cypress window will open
- You'll see a welcome screen
- Choose "E2E Testing"

---

### STEP 3: Select a Browser

Cypress will ask you to choose a browser:
- Click "Chrome" (or any browser you have)
- Click "Start E2E Testing in Chrome"

A new Chrome window will open - this is where tests run!

---

### STEP 4: Choose a Test to Run

You'll see a list of test files:

```
📁 e2e/
  📁 booking-flow/
    📄 complete-purchase.cy.js    ← Start here!
  📁 data-layer/
    📄 page-views.cy.js
```

**Click on:** `complete-purchase.cy.js`

---

### STEP 5: Watch the Magic! 🎬

Now you'll see:

**Left Side (Test Code):**
- All test steps listed
- Green ✓ = Passed
- Red ✗ = Failed

**Right Side (Browser):**
- Your website loads automatically
- Cypress clicks buttons
- Fills forms
- Navigates pages
- Just like a real user!

**What the test does:**
1. Visits homepage
2. Searches for flights (BOM → HYD)
3. Selects onward and return flights
4. Fills traveller details
5. Adds ancillary services (seat, priority boarding, lounge)
6. Completes payment
7. Validates confirmation page
8. **Checks ALL Adobe Data Layer events!**

---

### STEP 6: Understanding the Results

#### ✅ Green Checkmarks = Success!

Each step shows what was validated:
```
✓ Homepage page view
✓ Search initiated 
✓ Flight selected
✓ Purchase event validated
✓ All product list items present
✓ Adobe Edge Network call succeeded
```

#### ❌ Red X = Something Failed

If a test fails:
- Click on the failed step
- See the error message
- Screenshot is automatically saved
- Video is recorded

---

### STEP 7: Viewing Test Results

**Screenshots** (if tests fail):
```bash
open cypress/screenshots/
```

**Videos** (all test runs):
```bash
open cypress/videos/
```

---

## 🎯 What Our Tests Validate

### Complete Booking Flow Test

**Journey Tested:**
```
Homepage → Search → Select Flights → Traveller Details 
→ Ancillary Services → Payment → Confirmation
```

**Adobe Events Validated:**
1. ✅ `pageView` - Homepage loads
2. ✅ `searchInitiated` - User searches for flights
3. ✅ `pageView` - Search results page
4. ✅ `searchProceedToTravellerDetails` - Flights selected
5. ✅ `pageView` - Traveller details page
6. ✅ `proceedToPayment` - Ancillaries selected
7. ✅ `pageView` - Payment page
8. ✅ **`purchase`** - THE BIG ONE! Complete booking

**What We Check in Purchase Event:**
- ✅ Transaction ID exists
- ✅ Total revenue is correct
- ✅ PNR (booking reference) is 6 characters
- ✅ Product list items array:
  - Flight 1 (onward)
  - Flight 2 (return)
  - Seat selection
  - Priority boarding
  - Lounge access
- ✅ Each product has: ID, name, category, price, quantity, currency
- ✅ Haul type classification (short haul / long haul)
- ✅ No PII (personal info) leaked
- ✅ Adobe Edge Network call returns 200 OK

---

## 🎮 Interactive Features

### Time Travel Debugging

In Cypress, you can:

1. **Hover over any step** - See what the page looked like
2. **Click on a step** - Browser goes back to that moment
3. **Pin a snapshot** - Keep a specific view
4. **Compare states** - Before and after

### Command Log

Left side shows all commands:
- `VISIT` - Visited a page
- `GET` - Found an element
- `CLICK` - Clicked something
- `TYPE` - Typed text
- `WAIT` - Waited for something

Click any command to see details!

### Network Tab

See all network requests:
- Adobe Analytics calls
- API calls
- Images loaded
- Everything!

---

## 🎨 Running Tests Different Ways

### 1. Interactive Mode (Visual)
```bash
npm run test:e2e:open
```
**Best for:** Learning, debugging, development

### 2. Headless Mode (Fast)
```bash
npm run test:e2e
```
**Best for:** CI/CD, quick validation
**What happens:** Tests run in background, results in terminal

### 3. Specific Browser
```bash
npm run test:e2e:chrome
npm run test:e2e:firefox
```

### 4. Just Booking Tests
```bash
npm run test:booking
```

### 5. Just Data Layer Tests
```bash
npm run test:datalayer
```

### 6. One Specific File
```bash
npx cypress run --spec "cypress/e2e/booking-flow/complete-purchase.cy.js"
```

---

## 📊 Reading Test Code (Explained)

Let's break down what you see in the test file:

### Test Structure
```javascript
describe('Complete Booking Flow', () => {
  // This is like a chapter title
  
  it('should complete full booking journey', () => {
    // This is what we're testing
    
    cy.visit('/');  // Go to homepage
    // ... more steps ...
  });
});
```

### Common Cypress Commands

```javascript
// Navigate
cy.visit('/search')  // Go to /search page

// Find and click
cy.get('[data-testid="button"]').click()  // Click a button

// Type text
cy.get('[data-testid="email"]').type('test@example.com')

// Check URL
cy.url().should('include', '/confirmation')

// Wait for something
cy.waitForAdobeEvent('purchase', 10000)  // Wait up to 10 seconds

// Assertions (checks)
expect(value).to.equal('expected')  // Should be equal
expect(value).to.exist  // Should exist
expect(array).to.have.length(5)  // Should have 5 items
```

### Our Custom Commands

We created special commands for Adobe:

```javascript
// Wait for Adobe Data Layer
cy.waitForAdobeDataLayer()

// Wait for specific event
cy.waitForAdobeEvent('purchase')

// Validate entire purchase event
cy.validatePurchaseEvent(event)

// Check for privacy issues
cy.checkForPII(data)

// Search for flights
cy.searchFlights({ origin: 'BOM', destination: 'HYD' })
```

---

## 🐛 Troubleshooting

### "Cannot find module 'cypress'"
**Solution:**
```bash
npm install --save-dev cypress
```

### "Application not accessible"
**Solution:** Start the frontend first!
```bash
cd frontend
npm run start
```

### Tests timeout / take too long
**Solution:** This is normal! A full booking flow test can take 30-60 seconds

### "No tests found"
**Solution:** Make sure you're in the project root directory

### Browser doesn't open
**Solution:** 
```bash
npx cypress open --browser chrome
```

---

## 💡 Pro Tips

1. **Keep Frontend Running**: Don't close the terminal running your app

2. **Read the Logs**: Left side shows exactly what's happening

3. **Use Interactive Mode**: It's the best way to learn

4. **Screenshots Help**: They show exactly what went wrong

5. **Start Simple**: Run one test first, understand it, then explore more

6. **Console Logs**: Open browser DevTools to see console.log outputs

7. **Network Tab**: See all Adobe Analytics calls in real-time

---

## 🎯 Your Learning Path

### Day 1: Get Familiar
1. ✅ Install Cypress
2. ✅ Run one test in interactive mode
3. ✅ Watch it execute
4. ✅ Understand the results

### Day 2: Explore
1. Try different tests
2. Modify test parameters
3. See what breaks, what works
4. Learn from failures

### Day 3: Customize
1. Add new assertions
2. Test different scenarios
3. Create your own test file

---

## 📚 Quick Reference

### Start Testing Checklist
- [ ] Frontend is running (http://localhost:3002)
- [ ] Terminal is in project root
- [ ] Run `npm run test:e2e:open`
- [ ] Select browser
- [ ] Click a test file
- [ ] Watch it run!

### Common Commands
```bash
# Interactive mode
npm run test:e2e:open

# Headless mode
npm run test:e2e

# Specific test
npm run test:booking

# Stop tests
Ctrl + C
```

### What to Look For
- ✅ Green checkmarks = Success
- ❌ Red X = Failed
- ⏱️ Time for each step
- 📸 Screenshots (on failure)
- 🎬 Videos (all tests)

---

## 🎉 You're Ready!

**Next Step:** Run your first test!

```bash
npm run test:e2e:open
```

Then click on `complete-purchase.cy.js` and watch the magic happen! 🚀

---

## 🆘 Need Help?

1. Check the error message
2. Look at screenshots in `cypress/screenshots/`
3. Watch videos in `cypress/videos/`
4. Read test logs in terminal
5. Check browser console (F12)

**Remember:** Cypress is learning by doing. Don't worry about breaking things - that's what tests are for!

Happy Testing! 🎊

