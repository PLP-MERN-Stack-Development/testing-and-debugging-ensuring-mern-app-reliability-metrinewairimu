// Custom Cypress commands

// Create a bug
Cypress.Commands.add('createBug', (bugData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/bugs`,
    body: {
      ...bugData,
      reportedBy: 'Cypress Test User',
      status: 'open',
      priority: bugData.priority || 'medium'
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body.data;
  });
});

// Delete a bug
Cypress.Commands.add('deleteBug', (bugId) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/bugs/${bugId}`
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

// Clear all bugs
Cypress.Commands.add('clearBugs', () => {
  cy.request('GET', `${Cypress.env('apiUrl')}/bugs`).then((response) => {
    if (response.body.data && response.body.data.length > 0) {
      response.body.data.forEach(bug => {
        cy.deleteBug(bug._id);
      });
    }
  });
});

// Login via API
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password }
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
    return response.body;
  });
});

// Logout
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
  cy.visit('/login');
});

// Register a test user
Cypress.Commands.add('registerUser', (userData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: userData,
    failOnStatusCode: false // Don't fail if user already exists
  });
});

// UI Commands
Cypress.Commands.add('fillBugForm', (bugData) => {
  // Fill out the bug form
  cy.get('[data-testid="bug-form"]').within(() => {
    // Step 1
    cy.get('input[name="title"]').type(bugData.title);
    cy.get('textarea[name="description"]').type(bugData.description);
    cy.get('select[name="priority"]').select(bugData.priority || 'medium');
    
    // Go to next step
    cy.contains('Next: Steps to Reproduce').click();
    
    // Step 2 - Add steps to reproduce
    if (bugData.stepsToReproduce) {
      bugData.stepsToReproduce.forEach((step, index) => {
        if (index > 0) {
          cy.contains('Add Another Step').click();
        }
        cy.get(`input[name="stepsToReproduce[${index}]"]`).type(step);
      });
    }
    
    // Add environment info
    if (bugData.environment) {
      cy.get('input[name="environment.os"]').type(bugData.environment.os || '');
      cy.get('input[name="environment.browser"]').type(bugData.environment.browser || '');
      cy.get('input[name="environment.version"]').type(bugData.environment.version || '');
    }
    
    // Go to next step
    cy.contains('Next: Contact Info').click();
    
    // Step 3
    cy.get('input[name="reportedBy"]').clear().type(bugData.reportedBy || 'Test User');
    
    if (bugData.assignedTo) {
      cy.get('input[name="assignedTo"]').type(bugData.assignedTo);
    }
    
    // Submit
    cy.contains('Submit Bug Report').click();
  });
});

// Check for toast/success messages
Cypress.Commands.add('shouldSeeSuccessMessage', (message) => {
  cy.contains(message || 'success', { matchCase: false }).should('be.visible');
});

// Check for error messages
Cypress.Commands.add('shouldSeeErrorMessage', (message) => {
  cy.contains(message || 'error', { matchCase: false }).should('be.visible');
});

// Wait for loading to complete
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist');
});

// Take a screenshot with a descriptive name
Cypress.Commands.add('takeNamedScreenshot', (name) => {
  cy.screenshot(name, { capture: 'viewport' });
});

// Debug helper: log current state
Cypress.Commands.add('debugLog', (message, data = {}) => {
  cy.log(`🔍 ${message}`, data);
});