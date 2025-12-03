// Import commands
import './commands';

// Global before each hook
beforeEach(() => {
  // Clear localStorage
  cy.clearLocalStorage();
  
  // Clear cookies
  cy.clearCookies();
  
  // Clear session storage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
  
  // Reset the database state (if API endpoint exists)
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/test/reset`,
    failOnStatusCode: false // Don't fail if endpoint doesn't exist
  });
  
  // Register a test user if needed
  cy.registerUser({
    name: 'Cypress Test User',
    email: 'cypress@test.com',
    password: 'password123'
  }).then(() => {
    // Login with the test user
    cy.login('cypress@test.com', 'password123');
  });
  
  // Visit the app
  cy.visit('/');
});

// Global after each hook
afterEach(() => {
  // Logout after each test
  cy.logout();
  
  // Clear bugs
  cy.clearBugs();
});

// Error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error but don't fail the test
  console.error('Uncaught exception:', err);
  
  // Return false to prevent Cypress from failing the test
  return false;
});

// Custom console logging
Cypress.on('log:added', (log) => {
  if (log.name === 'xhr' && log.displayName === 'fetch') {
    console.log('📡 Network Request:', log);
  }
});

// Screenshot on failure
Cypress.on('fail', (error, runnable) => {
  // Take screenshot before failing
  const testName = runnable.title.replace(/[^a-zA-Z0-9]/g, '_');
  cy.screenshot(`failure_${testName}`);
  
  // Throw the error to fail the test
  throw error;
});