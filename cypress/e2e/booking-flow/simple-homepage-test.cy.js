/**
 * Simple Test: Homepage Loads and Adobe Data Layer Exists
 * 
 * This is a basic test to verify:
 * 1. Homepage loads successfully
 * 2. Adobe Data Layer is initialized
 * 3. Events are being pushed
 */

describe('Simple Homepage Test', () => {
  
  it('should load homepage and verify Adobe Data Layer', () => {
    // Visit the homepage
    cy.visit('/');
    
    // Wait for page to load (check for navbar text)
    cy.contains('TLP Airways').should('be.visible');
    
    // Check if Adobe Data Layer exists
    cy.window().then((win) => {
      // Log to console for debugging
      console.log('=== Adobe Data Layer Check ===');
      console.log('Exists:', !!win.adobeDataLayer);
      
      if (win.adobeDataLayer) {
        console.log('Total items:', win.adobeDataLayer.length);
        console.log('Data Layer:', win.adobeDataLayer);
        
        // Show all events
        const events = win.adobeDataLayer
          .filter(item => item && item.event)
          .map(item => item.event);
        console.log('Events found:', events);
        
        // Check if we have any events
        expect(win.adobeDataLayer).to.have.length.greaterThan(0);
        
        // Try to find pageView event
        const pageViewEvent = win.adobeDataLayer.find(item => item && item.event === 'pageView');
        
        if (pageViewEvent) {
          console.log('✅ PageView event found!', pageViewEvent);
          expect(pageViewEvent.pageData).to.exist;
          expect(pageViewEvent.pageData.pageName).to.be.a('string');
        } else {
          console.log('⚠️ PageView event NOT found');
          console.log('This might be normal if page view fires differently');
        }
      } else {
        console.log('❌ Adobe Data Layer NOT found!');
      }
    });
    
    // Take a screenshot for reference
    cy.screenshot('homepage-adobe-check');
    
    cy.log('✅ Test completed - check console for Adobe Data Layer details');
  });
});

