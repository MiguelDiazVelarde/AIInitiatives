Feature: Data Management System
  As a system administrator
  I want to ensure data integrity and validation
  So that the application handles data securely and correctly

  Background:
    Given the application is running
    And the database is accessible

  @data-validation
  Scenario: Client-side data validation
    Given I am on the registration page
    When I enter invalid data in the form fields
    Then I should see validation errors on the client side
    And the form should not be submitted

  @data-validation
  Scenario: Server-side data validation
    Given I send a registration request with invalid data
    When the server processes the request
    Then the server should return validation errors
    And no user should be created in the database

  @data-validation
  Scenario: Input sanitization to prevent injection attacks
    Given I am registering a new user
    When I enter potentially malicious scripts in input fields
    Then the system should sanitize the input
    And no script execution should occur

  @data-validation
  Scenario: Data type constraint enforcement
    Given I am creating a new product
    When I enter non-numeric values in price field
    Then the system should reject the input
    And display appropriate error message

  @data-validation
  Scenario: Email format validation during registration
    Given I am on the registration page
    When I enter an invalid email format
    Then the system should validate the email format
    And show an error message for invalid email

  @data-storage
  Scenario: Secure password storage
    Given I register a new user with a password
    When the user data is stored in the database
    Then the password should be encrypted using bcrypt
    And the plain text password should not be stored

  @data-storage
  Scenario: Product data persistence
    Given I am an authenticated user
    When I create a new product
    Then the product data should be stored with proper structure
    And all required fields should be saved correctly

  @data-storage
  Scenario: User session data management
    Given I am logged into the system
    When I perform various actions
    Then my session data should be maintained consistently
    And session should persist across page refreshes

  @data-integrity
  Scenario: Unique constraint enforcement for usernames
    Given a user with username "testuser" already exists
    When I try to register with the same username
    Then the system should prevent duplicate registration
    And return appropriate error message

  @data-integrity
  Scenario: Unique constraint enforcement for emails
    Given a user with email "test@example.com" already exists
    When I try to register with the same email
    Then the system should prevent duplicate registration
    And return appropriate error message

  @data-consistency
  Scenario: Product creation with proper timestamps
    Given I am an authenticated user
    When I create a new product
    Then the product should have creation timestamp
    And the creator information should be recorded

  @data-consistency
  Scenario: Data integrity during product deletion
    Given I have products in the system
    When I delete a product
    Then the product should be completely removed
    And no orphaned data should remain

  @error-handling
  Scenario: Graceful handling of database connection errors
    Given the database connection is temporarily unavailable
    When I try to perform data operations
    Then the system should handle the error gracefully
    And provide meaningful error message to the user

  @validation-feedback
  Scenario: Real-time validation feedback
    Given I am filling out a form
    When I enter invalid data in any field
    Then validation feedback should appear immediately
    And guide me to correct the input

  @data-security
  Scenario: Protection against SQL injection
    Given I am using forms that interact with the database
    When I enter SQL injection attempts in input fields
    Then the system should prevent SQL injection
    And safely handle the malicious input