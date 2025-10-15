/**
 * Custom Cypress commands for AEP Web SDK testing
 */

/**
 * Wait for Adobe Data Layer to be initialized
 */
Cypress.Commands.add('waitForAdobeDataLayer', (timeout = 5000) => {
  cy.window({ timeout }).should((win) => {
    expect(win.adobeDataLayer).to.exist;
    expect(Array.isArray(win.adobeDataLayer)).to.be.true;
  });
});

/**
 * Clear Adobe Data Layer
 */
Cypress.Commands.add('clearAdobeDataLayer', () => {
  cy.window().then((win) => {
    if (win.adobeDataLayer) {
      win.adobeDataLayer.length = 0;
      // Reset computed state if it exists
      if (win._adobeDataLayerState) {
        win._adobeDataLayerState = {};
      }
    }
  });
});

/**
 * Get current Adobe Data Layer state
 */
Cypress.Commands.add('getAdobeDataLayerState', () => {
  return cy.window().then((win) => {
    if (win.adobeDataLayer && win.adobeDataLayer.getState) {
      return win.adobeDataLayer.getState();
    }
    return win._adobeDataLayerState || {};
  });
});

/**
 * Wait for specific Adobe event to be pushed
 * @param {string} eventName - Name of the event to wait for
 * @param {number} timeout - Timeout in milliseconds
 */
Cypress.Commands.add('waitForAdobeEvent', (eventName, timeout = 10000) => {
  // Use a simple, direct approach with Cypress retry-ability
  cy.window({ timeout, log: false })
    .its('adobeDataLayer', { timeout })
    .should((dataLayer) => {
      // Cypress will automatically retry this assertion
      const event = (dataLayer || []).find(item => item && item.event === eventName);
      
      // Debug logging
      if (!event) {
        const available = (dataLayer || [])
          .filter(item => item && item.event)
          .map(item => item.event);
        console.log(`🔍 Waiting for: "${eventName}". Available: [${available.join(', ')}]`);
      }
      
      // Assertion - Cypress retries until this passes
      expect(event, `Event "${eventName}" should be in data layer`).to.exist;
    });
  
  // Log success (outside of .then())
  cy.log(`✅ Captured Adobe event: **${eventName}**`);
  
  // After the assertion passes, retrieve and return the event
  cy.window({ log: false }).then((win) => {
    const event = (win.adobeDataLayer || []).find(item => item && item.event === eventName);
    // Just return the event, no cy commands here
    return event;
  });
});

/**
 * Intercept Adobe Edge Network calls
 */
Cypress.Commands.add('interceptAdobeEdgeCalls', () => {
  cy.intercept('POST', '**/ee/v1/interact*', (req) => {
    // Log the Adobe Edge call
    console.log('=== Adobe Edge Network Call Intercepted ===');
    console.log(JSON.stringify(req.body, null, 2));
    
    req.continue();
  }).as('adobeEdgeCall');
  
  cy.intercept('POST', '**/ee/v1/collect*', (req) => {
    // Log the Adobe Edge collect call
    console.log('=== Adobe Edge Network Collect Call ===');
    console.log(JSON.stringify(req.body, null, 2));
    
    req.continue();
  }).as('adobeCollectCall');
});

/**
 * Validate XDM schema structure
 * @param {object} xdmData - XDM data to validate
 * @param {object} requiredFields - Required fields object
 */
Cypress.Commands.add('validateXDMSchema', (xdmData, requiredFields = {}) => {
  const defaultRequired = {
    eventType: 'string',
    timestamp: 'string',
    '_id': 'string',
    web: 'object',
    ...requiredFields
  };
  
  Object.entries(defaultRequired).forEach(([field, type]) => {
    const value = getNestedProperty(xdmData, field);
    expect(value, `Field "${field}" should exist`).to.exist;
    
    if (type) {
      expect(typeof value, `Field "${field}" should be of type ${type}`).to.equal(type);
    }
  });
});

/**
 * Validate commerce purchase event
 * @param {object} eventData - Event data to validate
 */
Cypress.Commands.add('validatePurchaseEvent', (eventData) => {
  // Validate event structure
  expect(eventData).to.have.property('event', 'purchase');
  expect(eventData).to.have.property('eventData');
  
  const { revenue, paymentDetails, customer, booking } = eventData.eventData;
  
  // Validate revenue object
  expect(revenue).to.exist;
  expect(revenue).to.have.property('transactionId').that.is.a('string');
  expect(revenue).to.have.property('totalRevenue').that.is.a('number');
  expect(revenue).to.have.property('currency', 'INR');
  expect(revenue).to.have.property('productListItems').that.is.an('array');
  expect(revenue).to.have.property('bookingReference').that.is.a('string');
  expect(revenue).to.have.property('paymentStatus', 'completed');
  
  // Validate product list items
  revenue.productListItems.forEach((item, index) => {
    expect(item, `Product ${index}`).to.have.property('productId');
    expect(item, `Product ${index}`).to.have.property('productName');
    expect(item, `Product ${index}`).to.have.property('category');
    expect(item, `Product ${index}`).to.have.property('price');
    expect(item, `Product ${index}`).to.have.property('quantity');
    expect(item, `Product ${index}`).to.have.property('currency');
  });
  
  // Validate payment details
  expect(paymentDetails).to.exist;
  expect(paymentDetails).to.have.property('pnr').that.is.a('string').and.has.length(6);
  expect(paymentDetails).to.have.property('totalAmount').that.is.a('number');
  
  // Validate customer info
  expect(customer).to.exist;
  
  // Validate booking info
  expect(booking).to.exist;
  expect(booking).to.have.property('tripType');
  expect(booking).to.have.property('cabinClass');
  expect(booking).to.have.property('passengers').that.is.a('number');
  expect(booking).to.have.property('origin');
  expect(booking).to.have.property('destination');
  expect(booking).to.have.property('haulType').that.is.an('object');
  
  cy.log('✅ Purchase event validation passed');
});

/**
 * Validate page view event
 */
Cypress.Commands.add('validatePageViewEvent', (eventData) => {
  expect(eventData).to.have.property('event', 'pageView');
  expect(eventData).to.have.property('pageData');
  
  const { pageData } = eventData;
  expect(pageData).to.have.property('pageName').that.is.a('string');
  expect(pageData).to.have.property('pageURL').that.is.a('string');
  expect(pageData).to.have.property('pageType').that.is.a('string');
  
  cy.log('✅ Page view validation passed');
});

/**
 * Validate search event
 */
Cypress.Commands.add('validateSearchEvent', (eventData) => {
  expect(eventData).to.have.property('event', 'searchInitiated');
  expect(eventData).to.have.property('eventData');
  
  const { searchContext } = eventData.eventData;
  expect(searchContext).to.exist;
  expect(searchContext).to.have.property('searchCriteria');
  expect(searchContext.searchCriteria).to.have.property('originAirport');
  expect(searchContext.searchCriteria).to.have.property('destinationAirport');
  expect(searchContext.searchCriteria).to.have.property('departureDate');
  expect(searchContext.searchCriteria).to.have.property('tripType');
  
  cy.log('✅ Search event validation passed');
});

/**
 * Check for PII in data
 * @param {object} data - Data to check for PII
 */
Cypress.Commands.add('checkForPII', (data) => {
  const dataStr = JSON.stringify(data);
  
  // Email pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = dataStr.match(emailPattern);
  
  if (emails && emails.length > 0) {
    cy.log(`⚠️ Warning: Found ${emails.length} potential email(s): ${emails.join(', ')}`);
  }
  
  // Phone pattern (basic)
  const phonePattern = /\d{10}/g;
  const phones = dataStr.match(phonePattern);
  
  if (phones && phones.length > 0) {
    cy.log(`⚠️ Warning: Found ${phones.length} potential phone number(s)`);
  }
  
  // Credit card pattern (basic)
  const ccPattern = /\d{16}/g;
  const cards = dataStr.match(ccPattern);
  
  if (cards && cards.length > 0) {
    cy.log(`⚠️ Warning: Found ${cards.length} potential credit card number(s)`);
  }
});

/**
 * Wait for Adobe Edge Network response
 */
Cypress.Commands.add('waitForEdgeResponse', (timeout = 10000) => {
  cy.wait('@adobeEdgeCall', { timeout }).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 204]);
    return interception;
  });
});

/**
 * Verify required product list item fields
 */
Cypress.Commands.add('validateProductListItem', (item, category = 'flight') => {
  // Common fields for all products
  expect(item).to.have.property('productId').that.is.a('string');
  expect(item).to.have.property('productName').that.is.a('string');
  expect(item).to.have.property('category', category);
  expect(item).to.have.property('price').that.is.a('number');
  expect(item).to.have.property('quantity').that.is.a('number');
  expect(item).to.have.property('currency', 'INR');
  
  // Category-specific validation
  if (category === 'flight') {
    expect(item).to.have.property('origin').that.is.a('string');
    expect(item).to.have.property('destination').that.is.a('string');
    expect(item).to.have.property('departureDate').that.is.a('string');
    expect(item).to.have.property('cabinClass').that.is.a('string');
  } else if (category === 'ancillary') {
    expect(item).to.have.property('subcategory').that.is.a('string');
    expect(item).to.have.property('journey').that.is.a('string');
  }
  
  cy.log(`✅ Product list item (${category}) validation passed`);
});

// Helper function to get nested property
function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

