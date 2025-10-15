/**
 * E2E Test: Complete Booking Flow with AEP Web SDK Validation
 * 
 * This test validates the entire booking journey and ensures all
 * Adobe Experience Platform events are fired correctly with required attributes.
 */

describe('Complete Booking Flow - AEP Web SDK Validation', () => {
  
  before(() => {
    // Setup: Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
  });
  
  beforeEach(() => {
    // Intercept Adobe Edge Network calls before each test
    cy.interceptAdobeEdgeCalls();
  });
  
  it('should complete full booking journey with valid AEP events', () => {
    
    // ========================================
    // STEP 1: Homepage - Page View Event
    // ========================================
    cy.visit('/');
    cy.waitForAdobeDataLayer();
    
    // Wait for homepage page view event
    cy.waitForAdobeEvent('pageView', 10000).then((event) => {
      cy.validatePageViewEvent(event);
      expect(event.pageData.pageName).to.include('Home');
      expect(event.pageData.pageType).to.equal('home'); // Changed from 'homepage' to 'home'
    });
    
    
    // ========================================
    // STEP 2: Search for Flights
    // ========================================
    const searchParams = {
      origin: 'BOM',
      destination: 'HYD',
      tripType: 'roundtrip',
      cabinClass: 'business',
      adults: 2,
      departureDate: getDatePlusDays(30),
      returnDate: getDatePlusDays(37)
    };
    
    cy.log('**Searching for flights**', searchParams);
    cy.searchFlights(searchParams);
    
    // Wait for search initiated event
    cy.waitForAdobeEvent('searchInitiated', 10000).then((event) => {
      cy.validateSearchEvent(event);
      
      const { searchContext } = event.eventData;
      expect(searchContext.searchCriteria.originAirport).to.equal('BOM');
      expect(searchContext.searchCriteria.destinationAirport).to.equal('HYD');
      expect(searchContext.searchCriteria.tripType).to.equal('roundtrip');
      expect(searchContext.searchCriteria.cabinClass).to.equal('business');
      expect(searchContext.searchCriteria.passengers.total).to.equal(2);
    });
    
    
    // ========================================
    // STEP 3: Search Results - Select Flights
    // ========================================
    cy.url().should('include', '/search-results');
    
    // Wait for search results page view
    cy.waitForAdobeEvent('pageView').then((event) => {
      expect(event.pageData.pageName).to.include('Search Results');
    });
    
    // Select onward flight
    cy.get('[data-testid="flight-card"]').first().within(() => {
      cy.get('[data-testid="select-flight-button"]').click();
    });
    
    // Select return flight
    cy.get('[data-testid="return-flight-card"]').first().within(() => {
      cy.get('[data-testid="select-return-flight-button"]').click();
    });
    
    // Click Book button
    cy.get('[data-testid="book-button"]').click();
    
    // Wait for searchProceedToTravellerDetails event
    cy.waitForAdobeEvent('searchProceedToTravellerDetails').then((event) => {
      expect(event).to.have.property('searchId');
      expect(event).to.have.property('pnr').that.has.length(6);
      expect(event.selectedFlights.onward).to.exist;
      expect(event.selectedFlights.return).to.exist;
      
      // Store PNR for later validation
      cy.wrap(event.pnr).as('bookingPNR');
    });
    
    
    // ========================================
    // STEP 4: Traveller Details
    // ========================================
    cy.url().should('include', '/traveller-details');
    
    // Fill traveller details
    cy.get('[data-testid="traveller-title-0"]').select('Mr');
    cy.get('[data-testid="traveller-firstname-0"]').type('John');
    cy.get('[data-testid="traveller-lastname-0"]').type('Doe');
    cy.get('[data-testid="traveller-dob-0"]').type('1985-05-15');
    
    cy.get('[data-testid="traveller-title-1"]').select('Mrs');
    cy.get('[data-testid="traveller-firstname-1"]').type('Jane');
    cy.get('[data-testid="traveller-lastname-1"]').type('Doe');
    cy.get('[data-testid="traveller-dob-1"]').type('1987-08-20');
    
    // Contact details
    cy.get('[data-testid="contact-email"]').type('john.doe@example.com');
    cy.get('[data-testid="contact-phone"]').type('9876543210');
    
    // Continue to ancillary services
    cy.get('[data-testid="continue-to-ancillary"]').click();
    
    
    // ========================================
    // STEP 5: Ancillary Services
    // ========================================
    cy.url().should('include', '/ancillary-services');
    
    // Select seat for passenger 1
    cy.get('[data-testid="select-seat-0-onward"]').click();
    cy.get('[data-testid="seat-4W"]').click(); // Window seat
    cy.get('[data-testid="confirm-seat"]').click();
    
    // Add priority boarding
    cy.get('[data-testid="priority-boarding-0-onward"]').check();
    
    // Add lounge access
    cy.get('[data-testid="lounge-access-0-onward"]').check();
    
    // Proceed to payment
    cy.get('[data-testid="proceed-to-payment"]').click();
    
    // Wait for proceedToPayment event
    cy.waitForAdobeEvent('proceedToPayment').then((event) => {
      expect(event.bookingContext).to.exist;
      expect(event.ancillaryServices).to.exist;
      expect(event.ancillaryServices.onward.seat).to.include('4W');
      expect(event.ancillaryServices.onward.priorityBoarding).to.have.length.greaterThan(0);
      expect(event.ancillaryServices.onward.loungeAccess).to.have.length.greaterThan(0);
    });
    
    
    // ========================================
    // STEP 6: Payment
    // ========================================
    cy.url().should('include', '/payment');
    
    // Select payment method
    cy.get('[data-testid="payment-method-netbanking"]').click();
    cy.get('[data-testid="bank-select"]').select('HDFC');
    
    // Agree to terms
    cy.get('[data-testid="terms-checkbox"]').check();
    
    // Complete payment
    cy.get('[data-testid="complete-payment"]').click();
    
    
    // ========================================
    // STEP 7: Confirmation - Purchase Event
    // ========================================
    cy.url().should('include', '/confirmation', { timeout: 15000 });
    
    // Wait for purchase event - THE CRITICAL EVENT!
    cy.waitForAdobeEvent('purchase', 15000).then((event) => {
      cy.log('**📊 Validating Purchase Event**');
      
      // Comprehensive purchase event validation
      cy.validatePurchaseEvent(event);
      
      // Validate PNR consistency
      cy.get('@bookingPNR').then((expectedPNR) => {
        expect(event.eventData.revenue.bookingReference).to.equal(expectedPNR);
        expect(event.eventData.paymentDetails.pnr).to.equal(expectedPNR);
      });
      
      // Validate product list items in detail
      const { productListItems } = event.eventData.revenue;
      
      cy.log(`**Found ${productListItems.length} product list items**`);
      
      // Should have at least:
      // - 2 flights (onward + return)
      // - 1 seat
      // - 1 priority boarding
      // - 1 lounge access
      expect(productListItems.length).to.be.at.least(5);
      
      // Validate flight products
      const flights = productListItems.filter(item => item.category === 'flight');
      expect(flights).to.have.length(2); // onward + return
      
      flights.forEach((flight, index) => {
        cy.validateProductListItem(flight, 'flight');
        expect(flight.origin).to.be.oneOf(['BOM', 'HYD']);
        expect(flight.destination).to.be.oneOf(['BOM', 'HYD']);
        expect(flight.cabinClass).to.equal('business');
      });
      
      // Validate ancillary products
      const ancillaries = productListItems.filter(item => item.category === 'ancillary');
      expect(ancillaries.length).to.be.at.least(3);
      
      // Validate seat
      const seat = ancillaries.find(item => item.subcategory === 'seat');
      expect(seat).to.exist;
      cy.validateProductListItem(seat, 'ancillary');
      expect(seat.seatNumber).to.equal('4W');
      expect(seat.journey).to.equal('onward');
      
      // Validate priority boarding
      const priorityBoarding = ancillaries.find(item => item.subcategory === 'priorityBoarding');
      expect(priorityBoarding).to.exist;
      cy.validateProductListItem(priorityBoarding, 'ancillary');
      
      // Validate lounge access
      const loungeAccess = ancillaries.find(item => item.subcategory === 'loungeAccess');
      expect(loungeAccess).to.exist;
      cy.validateProductListItem(loungeAccess, 'ancillary');
      
      // Validate revenue totals
      const { revenue, paymentDetails } = event.eventData;
      expect(revenue.totalRevenue).to.be.greaterThan(0);
      expect(revenue.totalRevenue).to.equal(paymentDetails.totalAmount);
      
      // Validate haul type
      const { haulType } = event.eventData.booking;
      expect(haulType).to.exist;
      expect(haulType).to.have.property('onward').that.is.oneOf(['short haul', 'long haul']);
      expect(haulType).to.have.property('overall').that.is.oneOf(['short haul', 'long haul']);
      
      // Check for PII
      cy.checkForPII(event);
      
      cy.log('✅ **All Purchase Event Validations Passed!**');
    });
    
    // Verify UI shows PNR
    cy.get('@bookingPNR').then((pnr) => {
      cy.contains(pnr).should('be.visible');
    });
    
    // Wait for Adobe Edge Network call and validate response
    cy.waitForEdgeResponse().then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      cy.log('✅ **Adobe Edge Network Response: Success**');
    });
    
    // Take screenshot of confirmation page
    cy.screenshot('booking-confirmation-success');
  });
  
  
  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  
  function getDatePlusDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
});

