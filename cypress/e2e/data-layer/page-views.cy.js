/**
 * Test: Page View Events - AEP Web SDK Validation
 * 
 * Validates that all pages fire correct page view events with required attributes
 */

describe('Page View Events - AEP Validation', () => {
  
  beforeEach(() => {
    cy.interceptAdobeEdgeCalls();
    cy.clearCookies();
    cy.clearLocalStorage();
  });
  
  const pages = [
    {
      name: 'Homepage',
      url: '/',
      expectedPageType: 'homepage',
      expectedPageName: 'Home'
    },
    {
      name: 'Search Results',
      url: '/search-results',
      setup: () => {
        cy.searchFlights({
          origin: 'DEL',
          destination: 'BOM'
        });
      },
      expectedPageType: 'search-results',
      expectedPageName: 'Search Results'
    }
  ];
  
  pages.forEach((page) => {
    it(`should fire valid page view event for ${page.name}`, () => {
      
      // Setup if needed
      if (page.setup) {
        page.setup();
      } else {
        cy.visit(page.url);
      }
      
      // Wait for Adobe Data Layer
      cy.waitForAdobeDataLayer();
      
      // Wait for page view event
      cy.waitForAdobeEvent('pageView', 10000).then((event) => {
        
        // Basic validation
        cy.validatePageViewEvent(event);
        
        // Page-specific validation
        const { pageData } = event;
        
        expect(pageData.pageName).to.include(page.expectedPageName);
        expect(pageData.pageType).to.equal(page.expectedPageType);
        expect(pageData.pageURL).to.be.a('string');
        expect(pageData.referrer).to.be.a('string');
        
        // User context
        if (event.userContext) {
          expect(event.userContext).to.have.property('isLoggedIn').that.is.a('boolean');
        }
        
        // Timestamp
        expect(event.timestamp).to.be.a('string');
        const timestamp = new Date(event.timestamp);
        expect(timestamp.toString()).to.not.equal('Invalid Date');
        
        cy.log(`✅ ${page.name} page view validated successfully`);
      });
    });
  });
  
  it('should include user agent and screen resolution', () => {
    cy.visit('/');
    cy.waitForAdobeDataLayer();
    
    cy.waitForAdobeEvent('pageView').then((event) => {
      const { pageData } = event;
      
      expect(pageData.userAgent).to.be.a('string');
      expect(pageData.screenResolution).to.be.a('string');
      expect(pageData.viewportSize).to.be.a('string');
      
      // Validate format
      expect(pageData.screenResolution).to.match(/\d+x\d+/);
      expect(pageData.viewportSize).to.match(/\d+x\d+/);
    });
  });
});

