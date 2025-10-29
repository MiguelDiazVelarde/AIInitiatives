# language: en
Feature: Navigation and UI
  As an application user
  I want to navigate easily through the interface
  So that I can use the application intuitively

  Background:
    Given the application is running at "http://localhost:3000"

  Scenario: Navigation from home page
    Given I am on the home page
    Then I should be automatically redirected to the login page

  Scenario: Navigation between login and registration
    Given I am on the login page
    When I click "Don't have an account? Register"
    Then I should be on the registration page
    When I click "Already have an account? Login"
    Then I should be on the login page

  Scenario: Interface responsiveness
    Given I am authenticated as "admin"
    When I change the browser window size
    Then the interface should adjust correctly
    And all elements should be accessible

  Scenario: UI elements validation in dashboard
    Given I am authenticated as "admin"
    When I am on the dashboard
    Then I should see the "Add Product" form
    And I should see the "Product List" section
    And I should see the "Logout" button
    And I should see the welcome message with my username

  Scenario: Form fields validation
    Given I am authenticated as "admin"
    When I am on the dashboard
    Then the form should have the fields:
      | field       | type     | required |
      | name        | text     | yes      |
      | description | textarea | yes      |
      | price       | number   | yes      |
      | category    | select   | yes      |
      | stock       | number   | yes      |

  Scenario: Session persistence
    Given I am authenticated as "admin"
    When I reload the page
    Then I should remain authenticated
    And I should stay on the dashboard

  Scenario: Session timeout (simulated)
    Given I am authenticated as "admin"
    When the session expires
    And I try to perform a protected action
    Then I should be redirected to the login page

  # REQ-UI-001: Intuitive navigation between login and registration
  Scenario: Easy switching between auth forms
    Given I am on the login page
    When I click "Don't have an account? Register"
    Then I should smoothly transition to the registration page
    And the registration form should be clearly visible
    When I click "Already have an account? Login"
    Then I should smoothly transition back to the login page
    And the login form should be clearly visible

  # REQ-UI-002: Appropriate redirection based on authentication
  Scenario: Authenticated user redirection
    Given I am authenticated as "admin"
    When I try to visit the login page
    Then I should be automatically redirected to the dashboard
    And I should not see the login form

  # REQ-UI-003: Clear visual indicators for current state
  Scenario: Visual state indicators
    Given I am on the login page
    Then I should see clear indicators that I'm on the login page
    When I switch to registration
    Then I should see clear indicators that I'm on the registration page
    When I am authenticated and on the dashboard
    Then I should see clear indicators of my logged-in state
    And I should see my username displayed

  # REQ-UI-004: Accessible logout functionality
  Scenario: Logout accessibility
    Given I am authenticated as "admin"
    When I am on the dashboard
    Then I should see a clearly visible logout button
    And the logout button should be easily accessible
    When I click the logout button
    Then I should be logged out immediately
    And redirected to the login page

  # REQ-UI-005: Responsive form layouts
  Scenario: Form responsiveness across devices
    Given I am on the login page
    When I view the page on different screen sizes
    Then the login form should adapt to the screen size
    And all form elements should remain accessible
    When I switch to registration page
    Then the registration form should also be responsive
    And maintain usability across all screen sizes

  # REQ-UI-006: Form validation with user feedback
  Scenario: Real-time form validation feedback
    Given I am on the registration page
    When I enter invalid data in form fields
    Then I should see immediate validation feedback
    And the feedback should be clear and helpful
    When I correct the invalid data
    Then the validation feedback should update accordingly

  # REQ-UI-007: Form submission state management
  Scenario: Form submission states
    Given I am on the login page
    When I submit the login form
    Then the submit button should be disabled during processing
    And I should see a loading indicator
    When the login completes
    Then the form should return to normal state

  # REQ-UI-008: Loading indicators for async operations
  Scenario: Loading indicators throughout the application
    Given I am logging in
    When the authentication is in progress
    Then I should see appropriate loading indicators
    When I am loading products on the dashboard
    Then I should see loading feedback
    When I am creating a new product
    Then I should see submission progress indicators

  # REQ-UI-009: Form data clearing after submission
  Scenario: Form reset after successful operations
    Given I am on the dashboard
    When I fill out the product form completely
    And I submit it successfully
    Then all form fields should be cleared automatically
    And the form should be ready for new input

  # REQ-UI-010 & REQ-UI-011: Responsive design across devices
  Scenario: Cross-device compatibility
    Given I am using the application
    When I access it from a desktop browser
    Then all features should work correctly
    When I access it from a tablet
    Then the interface should adapt appropriately
    And maintain full functionality
    When I access it from a mobile device
    Then the interface should be mobile-friendly
    And all actions should remain accessible

  # REQ-UI-012: Optimal layout adaptation
  Scenario: Layout optimization for different screens
    Given I am on the dashboard
    When I view it on a large desktop screen
    Then the product grid should utilize the available space efficiently
    When I view it on a smaller laptop screen
    Then the layout should compact appropriately
    When I view it on a mobile screen
    Then the products should stack vertically for easy scrolling

  # Navigation consistency and user experience
  Scenario: Consistent navigation experience
    Given I am authenticated as "admin"
    When I navigate through different sections of the application
    Then the navigation should be consistent
    And I should always know where I am
    And how to get to other sections

  # Error handling in UI
  Scenario: UI error handling
    Given I am using the application
    When a network error occurs during an operation
    Then I should see a user-friendly error message
    And the application should remain stable
    And I should be able to retry the operation

  # Accessibility features
  Scenario: Basic accessibility features
    Given I am using the application
    When I navigate using keyboard only
    Then all interactive elements should be accessible
    And the focus indicators should be clear
    When I use screen reader compatible features
    Then the application should provide appropriate labels and descriptions

  # Data validation feedback
  Scenario: Comprehensive validation feedback
    Given I am filling out forms in the application
    When I enter invalid data
    Then I should receive specific, helpful error messages
    And the messages should guide me on how to correct the errors
    When all data is valid
    Then validation feedback should confirm successful input

  # Performance and responsiveness
  Scenario: Application responsiveness
    Given I am using the application
    When I perform any user action
    Then the response should be immediate or show loading feedback
    And the application should remain responsive during operations
    When loading large amounts of data
    Then the interface should handle it gracefully without freezing