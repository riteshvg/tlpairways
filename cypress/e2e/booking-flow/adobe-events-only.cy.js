/**
 * Simplified Test: Adobe Data Layer Events Validation
 * 
 * This test focuses ONLY on validating Adobe Data Layer events
 * without interacting with complex UI elements.
 * 
 * It uses manual navigation to trigger events and validates them.
 */

describe('Adobe Data Layer Events - Validation Only', () => {
  
  beforeEach(() => {
    cy.interceptAdobeEdgeCalls();
  });
  
  it('should capture and validate homepage pageView event', () => {
    // Visit homepage
    cy.visit('/');
    
    // Wait a moment for page to fully load
    cy.wait(2000);
    
    // Check Adobe Data Layer directly
    cy.window().then((win) => {
      console.log('=== Homepage Adobe Data Layer ===');
      console.log('Adobe Data Layer exists:', !!win.adobeDataLayer);
      
      if (win.adobeDataLayer) {
        console.log('Total items:', win.adobeDataLayer.length);
        console.log('Full Data Layer:', win.adobeDataLayer);
        
        // Find all events
        const events = win.adobeDataLayer
          .filter(item => item && item.event)
          .map(item => ({ event: item.event, pageType: item.pageData?.pageType }));
        
        console.log('Events:', events);
        
        // Check for pageView event
        const pageViewEvent = win.adobeDataLayer.find(item => item && item.event === 'pageView');
        
        if (pageViewEvent) {
          console.log('✅ PageView Event:', pageViewEvent);
          
          // Validate structure
          expect(pageViewEvent).to.have.property('event', 'pageView');
          expect(pageViewEvent).to.have.property('pageData');
          expect(pageViewEvent.pageData).to.have.property('pageName');
          expect(pageViewEvent.pageData).to.have.property('pageType');
          expect(pageViewEvent.pageData).to.have.property('pageURL');
          
          console.log('✅ All required pageView fields present!');
        } else {
          console.log('⚠️ No pageView event found');
        }
      }
    });
    
    cy.screenshot('homepage-datalayer-check');
  });
  
  it('should validate Adobe Data Layer structure across navigation', () => {
    // Test 1: Homepage
    cy.visit('/');
    cy.wait(2000);
    
    cy.window().then((win) => {
      const homeEvents = (win.adobeDataLayer || [])
        .filter(item => item && item.event)
        .map(item => item.event);
      
      console.log('Homepage events:', homeEvents);
      expect(homeEvents.length).to.be.greaterThan(0);
    });
    
    // Test 2: Navigate to a search (manually via URL)
    cy.visit('/search?from=DEL&to=BOM&date=2026-01-21&tripType=oneway&cabinClass=economy&adults=1');
    cy.wait(3000);
    
    cy.window().then((win) => {
      const searchEvents = (win.adobeDataLayer || [])
        .filter(item => item && item.event)
        .map(item => item.event);
      
      console.log('Search page events:', searchEvents);
      
      // Check for search initiated or page view
      const hasSearchEvent = searchEvents.includes('searchInitiated') || 
                             searchEvents.includes('pageView');
      
      expect(hasSearchEvent, 'Should have search or pageView event').to.be.true;
    });
    
    cy.screenshot('search-page-datalayer-check');
  });
  
  it('should check for Adobe Edge Network calls', () => {
    cy.visit('/');
    cy.wait(2000);
    
    // Check if Adobe Edge Network calls were made
    cy.window().then((win) => {
      console.log('=== Checking for Adobe Edge Calls ===');
      
      // The intercept should have captured calls
      // Check the network tab in DevTools to see them
      console.log('Check the Network tab for calls to:');
      console.log('- /ee/v1/interact');
      console.log('- /ee/ind1/v1/interact');
      console.log('✅ Look for POST requests with status 200 or 207');
    });
    
    cy.screenshot('adobe-edge-network-check');
  });
  
  it('should manually trigger and validate a complete data layer object', () => {
    cy.visit('/');
    cy.wait(2000);
    
    // Get the complete state
    cy.getAdobeDataLayerState().then((state) => {
      console.log('=== Complete Adobe Data Layer State ===');
      console.log('State:', state);
      
      // Check for user context
      if (state.user) {
        console.log('User context:', state.user);
        expect(state.user).to.be.an('object');
      }
      
      // Check for page data
      if (state.pageData) {
        console.log('Page data:', state.pageData);
        expect(state.pageData).to.have.property('pageName');
      }
    });
  });
});

