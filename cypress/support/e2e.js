// ***********************************************************
// This file is processed and loaded automatically before test files
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';
import './aep-commands';

// Hide fetch/XHR logs for cleaner output (optional)
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global before hook to reset Adobe Data Layer
beforeEach(() => {
  cy.clearAdobeDataLayer();
});

// Global after hook to log Adobe Data Layer on failure
afterEach(function() {
  if (this.currentTest.state === 'failed') {
    cy.window({ log: false }).then((win) => {
      if (win.adobeDataLayer) {
        cy.log('=== Adobe Data Layer on Failure ===');
        console.log('Adobe Data Layer:', win.adobeDataLayer);
      }
    });
  }
});

