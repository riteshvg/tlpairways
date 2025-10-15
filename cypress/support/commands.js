/**
 * General Cypress custom commands
 */

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.get('[data-testid="login-button"]').click();
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="submit-login"]').click();
  cy.url().should('not.include', '/login');
});

// Search for flights
Cypress.Commands.add('searchFlights', (searchParams) => {
  const {
    origin = 'DEL',
    destination = 'BOM',
    departureDate,
    returnDate,
    tripType = 'oneway',
    cabinClass = 'economy',
    adults = 1,
    children = 0,
    infants = 0
  } = searchParams;
  
  cy.visit('/');
  
  // Fill search form
  cy.get('[data-testid="origin-input"]').type(origin);
  cy.get('[data-testid="destination-input"]').type(destination);
  cy.get('[data-testid="departure-date"]').type(departureDate || getDatePlusDays(30));
  
  if (tripType === 'roundtrip') {
    cy.get('[data-testid="trip-type-roundtrip"]').click();
    cy.get('[data-testid="return-date"]').type(returnDate || getDatePlusDays(37));
  }
  
  cy.get('[data-testid="cabin-class"]').select(cabinClass);
  
  // Set passengers
  if (adults > 1 || children > 0 || infants > 0) {
    cy.get('[data-testid="passengers-selector"]').click();
    if (adults > 1) {
      for (let i = 1; i < adults; i++) {
        cy.get('[data-testid="adult-increment"]').click();
      }
    }
    if (children > 0) {
      for (let i = 0; i < children; i++) {
        cy.get('[data-testid="child-increment"]').click();
      }
    }
    if (infants > 0) {
      for (let i = 0; i < infants; i++) {
        cy.get('[data-testid="infant-increment"]').click();
      }
    }
    cy.get('[data-testid="passengers-done"]').click();
  }
  
  cy.get('[data-testid="search-flights-button"]').click();
});

// Helper to get date in YYYY-MM-DD format
function getDatePlusDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

