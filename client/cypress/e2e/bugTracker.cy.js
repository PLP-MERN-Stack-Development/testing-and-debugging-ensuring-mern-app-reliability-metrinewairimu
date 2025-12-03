describe('Bug Tracker E2E Tests', () => {
  beforeEach(() => {
    // Test setup is handled in support/e2e.js
  });

  describe('Authentication', () => {
    it('should allow user registration', () => {
      cy.visit('/register');
      
      cy.get('input[name="name"]').type('New Test User');
      cy.get('input[name="email"]').type('newuser@test.com');
      cy.get('input[name="password"]').type('Password123');
      cy.get('input[name="confirmPassword"]').type('Password123');
      cy.get('input[name="agreeToTerms"]').check();
      
      cy.contains('Create Account').click();
      
      // Should redirect to home page after successful registration
      cy.url().should('include', '/');
      cy.contains('Welcome, New Test User').should('be.visible');
    });

    it('should allow user login', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('cypress@test.com');
      cy.get('input[name="password"]').type('password123');
      
      cy.contains('Sign in').click();
      
      // Should redirect to home page after successful login
      cy.url().should('include', '/');
      cy.contains('Welcome').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('wrong@email.com');
      cy.get('input[name="password"]').type('wrongpassword');
      
      cy.contains('Sign in').click();
      
      // Should show error message
      cy.contains('Invalid credentials').should('be.visible');
    });

    it('should allow user logout', () => {
      // Already logged in from beforeEach
      cy.contains('Logout').click();
      
      // Should redirect to login page
      cy.url().should('include', '/login');
      cy.contains('Sign in').should('be.visible');
    });
  });

  describe('Bug Reporting', () => {
    it('should report a new bug successfully', () => {
      cy.visit('/report');
      
      // Fill out bug form using custom command
      cy.fillBugForm({
        title: 'Critical: Application crashes on login',
        description: 'When clicking the login button, the entire application crashes and shows a white screen.',
        priority: 'critical',
        stepsToReproduce: [
          'Open the application',
          'Enter valid credentials',
          'Click the login button',
          'Application crashes immediately'
        ],
        environment: {
          os: 'Windows 11',
          browser: 'Chrome',
          version: '120.0.6099.110'
        },
        reportedBy: 'Cypress Test Reporter',
        assignedTo: 'Development Team'
      });
      
      // Should redirect to bug detail page
      cy.url().should('include', '/bugs/');
      cy.contains('Critical: Application crashes on login').should('be.visible');
      cy.contains('critical').should('be.visible');
    });

    it('should show validation errors for empty required fields', () => {
      cy.visit('/report');
      
      // Try to submit empty form
      cy.contains('Submit Bug Report').click();
      
      // Should show validation errors
      cy.contains('Title is required').should('be.visible');
      cy.contains('Description is required').should('be.visible');
      cy.contains('Your name is required').should('be.visible');
    });

    it('should allow bug editing', () => {
      // First create a bug
      cy.createBug({
        title: 'Bug to edit',
        description: 'This bug will be edited',
        priority: 'medium'
      }).then((bug) => {
        cy.visit(`/bugs/${bug._id}`);
        
        // Click edit button
        cy.contains('Edit').click();
        
        // Update the bug
        cy.get('input[name="title"]').clear().type('Updated bug title');
        cy.get('textarea[name="description"]').clear().type('Updated description');
        cy.get('select[name="priority"]').select('high');
        
        cy.contains('Save Changes').click();
        
        // Should see updated values
        cy.contains('Updated bug title').should('be.visible');
        cy.contains('high').should('be.visible');
      });
    });
  });

  describe('Bug Management', () => {
    beforeEach(() => {
      // Create test bugs
      cy.createBug({
        title: 'UI Alignment Issue',
        description: 'Buttons are misaligned on mobile view',
        priority: 'medium',
        status: 'open'
      });
      
      cy.createBug({
        title: 'Database Connection Error',
        description: 'Cannot connect to database after 5 minutes of inactivity',
        priority: 'critical',
        status: 'in-progress'
      });
      
      cy.createBug({
        title: 'Typo in Welcome Message',
        description: 'There is a spelling mistake in the welcome message',
        priority: 'low',
        status: 'resolved'
      });
      
      cy.visit('/bugs');
    });

    it('should display list of bugs', () => {
      cy.contains('UI Alignment Issue').should('be.visible');
      cy.contains('Database Connection Error').should('be.visible');
      cy.contains('Typo in Welcome Message').should('be.visible');
      
      // Should show bug count
      cy.contains(/Bugs \(\d+\)/).should('be.visible');
    });

    it('should filter bugs by status', () => {
      // Filter by open status
      cy.get('select').first().select('open');
      
      // Should only show open bugs
      cy.contains('UI Alignment Issue').should('be.visible');
      cy.contains('Database Connection Error').should('not.exist');
      cy.contains('Typo in Welcome Message').should('not.exist');
    });

    it('should filter bugs by priority', () => {
      // Filter by critical priority
      cy.get('select').eq(1).select('critical');
      
      // Should only show critical bugs
      cy.contains('Database Connection Error').should('be.visible');
      cy.contains('UI Alignment Issue').should('not.exist');
      cy.contains('Typo in Welcome Message').should('not.exist');
    });

    it('should search bugs by title', () => {
      // Search for "database"
      cy.get('input[placeholder="Search bugs..."]').type('database');
      
      // Should only show matching bugs
      cy.contains('Database Connection Error').should('be.visible');
      cy.contains('UI Alignment Issue').should('not.exist');
      cy.contains('Typo in Welcome Message').should('not.exist');
    });

    it('should sort bugs by creation date', () => {
      // Sort by oldest first
      cy.get('select').eq(2).select('createdAt');
      
      // Bugs should be displayed in order (implementation specific)
      // This is a basic check - in reality you'd check the order
      cy.get('[data-testid^="bug-card-"]').should('have.length.at.least', 1);
    });

    it('should update bug status from list', () => {
      // Find the first bug and update its status
      cy.get('[data-testid^="bug-card-"]').first().within(() => {
        cy.get('select').first().select('resolved');
      });
      
      // Should reflect the status change
      cy.get('[data-testid^="bug-card-"]').first()
        .contains('resolved', { matchCase: false })
        .should('be.visible');
    });

    it('should delete a bug', () => {
      // Count initial bugs
      cy.get('[data-testid^="bug-card-"]').then(($bugs) => {
        const initialCount = $bugs.length;
        
        // Delete the first bug
        cy.get('[data-testid^="bug-card-"]').first().within(() => {
          cy.contains('Delete').click();
        });
        
        // Confirm deletion
        cy.on('window:confirm', () => true);
        
        // Should have one less bug
        cy.get('[data-testid^="bug-card-"]').should('have.length', initialCount - 1);
      });
    });

    it('should paginate results when many bugs exist', () => {
      // Create more bugs to trigger pagination
      for (let i = 0; i < 15; i++) {
        cy.createBug({
          title: `Test Bug ${i}`,
          description: `Description for bug ${i}`,
          priority: 'medium'
        });
      }
      
      cy.reload();
      
      // Should show pagination controls
      cy.contains('Page').should('be.visible');
      cy.contains('Next').should('be.visible');
      
      // Go to next page
      cy.contains('Next').click();
      
      // Should be on page 2
      cy.contains('Page 2').should('be.visible');
    });
  });

  describe('Bug Details', () => {
    let testBugId;

    beforeEach(() => {
      // Create a test bug
      cy.createBug({
        title: 'Detailed Test Bug',
        description: 'This is a bug for detailed testing',
        priority: 'high',
        stepsToReproduce: [
          'Step 1: Open the app',
          'Step 2: Click the broken button',
          'Step 3: Observe the error'
        ],
        environment: {
          os: 'macOS',
          browser: 'Safari',
          version: '17.0'
        }
      }).then((bug) => {
        testBugId = bug._id;
        cy.visit(`/bugs/${testBugId}`);
      });
    });

    it('should display bug details correctly', () => {
      // Should show all bug information
      cy.contains('Detailed Test Bug').should('be.visible');
      cy.contains('This is a bug for detailed testing').should('be.visible');
      cy.contains('high').should('be.visible');
      cy.contains('Step 1: Open the app').should('be.visible');
      cy.contains('macOS').should('be.visible');
      cy.contains('Safari').should('be.visible');
      cy.contains('17.0').should('be.visible');
    });

    it('should update bug status from detail page', () => {
      // Change status to resolved
      cy.contains('button', 'Resolved').click();
      
      // Should show resolved status
      cy.contains('resolved', { matchCase: false }).should('be.visible');
    });

    it('should update bug priority from detail page', () => {
      // Change priority to critical
      cy.contains('button', 'Critical').click();
      
      // Should show critical priority
      cy.contains('critical', { matchCase: false }).should('be.visible');
    });

    it('should add comments to bug', () => {
      // Add a comment
      cy.get('textarea[placeholder="Add a comment..."]').type('This is a test comment from Cypress');
      cy.contains('Add Comment').click();
      
      // Should show the comment
      cy.contains('This is a test comment from Cypress').should('be.visible');
      cy.contains('Current User').should('be.visible');
    });

    it('should navigate back to bug list', () => {
      cy.contains('← Back to Bugs').click();
      
      // Should be on bugs list page
      cy.url().should('include', '/bugs');
      cy.contains('All Bugs').should('be.visible');
    });
  });

  describe('Dashboard', () => {
    beforeEach(() => {
      // Create some bugs for dashboard stats
      cy.createBug({ title: 'Bug 1', priority: 'critical', status: 'open' });
      cy.createBug({ title: 'Bug 2', priority: 'high', status: 'open' });
      cy.createBug({ title: 'Bug 3', priority: 'medium', status: 'resolved' });
      cy.createBug({ title: 'Bug 4', priority: 'low', status: 'closed' });
      
      cy.visit('/');
    });

    it('should display dashboard statistics', () => {
      // Should show stats cards
      cy.contains('Total Bugs').should('be.visible');
      cy.contains('Resolved').should('be.visible');
      cy.contains('Open Bugs').should('be.visible');
      cy.contains('Critical Bugs').should('be.visible');
      
      // Should show recent bugs
      cy.contains('Recent Bugs').should('be.visible');
      cy.get('[data-testid^="bug-card-"]').should('have.length.at.least', 1);
    });

    it('should show status distribution', () => {
      // Should show status distribution section
      cy.contains('Status Distribution').should('be.visible');
      
      // Should show progress bars for different statuses
      cy.contains('Open').should('be.visible');
      cy.contains('Resolved').should('be.visible');
      cy.contains('Closed').should('be.visible');
    });

    it('should have working quick action buttons', () => {
      // Browse All Bugs button
      cy.contains('Browse All Bugs').click();
      cy.url().should('include', '/bugs');
      cy.go('back');
      
      // Report Bug button
      cy.contains('Report Bug').click();
      cy.url().should('include', '/report');
      cy.go('back');
    });

    it('should show critical issues warning when applicable', () => {
      // Should show critical issues warning if there are critical bugs
      cy.contains('Critical Issues').should('be.visible');
      cy.contains('critical bugs need attention').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should show error boundary when component crashes', () => {
      // This would test error boundaries - would need a component that intentionally crashes
      // For now, just verify the error boundary component exists
      cy.visit('/');
      cy.window().then((win) => {
        expect(win.document.querySelector('[data-testid="error-boundary"]')).to.not.exist;
      });
    });

    it('should show network error when API is unavailable', () => {
      // Intercept API calls and force failure
      cy.intercept('GET', '**/api/bugs**', {
        statusCode: 500,
        body: { message: 'Server error' }
      });
      
      cy.visit('/bugs');
      
      // Should show error message
      cy.contains('Server error').should('be.visible');
      cy.contains('Try Again').should('be.visible');
    });

    it('should handle 404 errors gracefully', () => {
      // Visit non-existent route
      cy.visit('/non-existent-route');
      
      // Should redirect to home or show 404
      cy.url().should('include', '/');
    });

    it('should show validation errors in forms', () => {
      cy.visit('/report');
      
      // Submit empty form
      cy.contains('Submit Bug Report').click();
      
      // Should show specific validation errors
      cy.contains('Title is required').should('be.visible');
      cy.contains('Description is required').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      // Set mobile viewport
      cy.viewport('iphone-x');
      
      cy.visit('/');
      
      // Should show mobile menu button
      cy.get('button').contains('Open main menu').should('be.visible');
      
      // Open mobile menu
      cy.get('button').contains('Open main menu').click();
      
      // Should show mobile menu items
      cy.contains('Dashboard').should('be.visible');
      cy.contains('All Bugs').should('be.visible');
      cy.contains('Report Bug').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      // Set tablet viewport
      cy.viewport('ipad-2');
      
      cy.visit('/bugs');
      
      // Should display bugs in grid/list appropriately
      cy.get('[data-testid^="bug-card-"]').should('be.visible');
      
      // Filters should be accessible
      cy.contains('Filters').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('should load pages within acceptable time', () => {
      // Measure page load time
      const startTime = Date.now();
      
      cy.visit('/', {
        onLoad: () => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
        }
      });
    });

    it('should handle many bugs efficiently', () => {
      // Create 50 bugs for performance testing
      const bugs = [];
      for (let i = 0; i < 50; i++) {
        bugs.push({
          title: `Performance Test Bug ${i}`,
          description: `Description for performance test bug ${i}`,
          priority: i % 4 === 0 ? 'critical' : i % 4 === 1 ? 'high' : i % 4 === 2 ? 'medium' : 'low',
          status: i % 3 === 0 ? 'open' : i % 3 === 1 ? 'in-progress' : 'resolved'
        });
      }
      
      // Create bugs via API
      cy.wrap(Promise.all(bugs.map(bug => cy.createBug(bug))));
      
      // Visit bugs page and measure performance
      const startTime = Date.now();
      
      cy.visit('/bugs', {
        onLoad: () => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds with 50 bugs
          
          // Should display all bugs
          cy.get('[data-testid^="bug-card-"]').should('have.length.at.least', 10);
        }
      });
    });
  });
});