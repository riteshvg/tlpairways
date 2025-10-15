const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    
    // Test file location
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Support file
    supportFile: 'cypress/support/e2e.js',
    
    // Timeout settings
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Retry settings
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    setupNodeEvents(on, config) {
      // Custom event listeners for AEP testing
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      return config;
    },
    
    env: {
      // Adobe configuration
      adobeOrgId: 'YOUR_ADOBE_ORG_ID',
      adobeDatastreamId: 'YOUR_DATASTREAM_ID',
      
      // Test user credentials (use test accounts only!)
      testUserEmail: 'test@example.com',
      testUserPassword: 'TestPassword123',
      
      // Feature flags
      skipAuth: false,
      mockPayments: true
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'frontend/src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  }
});

