# language: en
Feature: User Authentication
  As an application user
  I want to be able to login and register
  So that I can access the application functionalities

  Background:
    Given the application is running at "http://localhost:3000"

  # REQ-AUTH-002: Username and email uniqueness validation
  Scenario: Register with duplicate username
    Given I am on the registration page
    When I enter the user data:
      | field     | value                    |
      | username  | admin                    |
      | email     | different@example.com    |
      | password  | password                 |
    And I click the auth button "Register"
    Then I should see an error message containing "Username already exists"

  # REQ-AUTH-004: Registration validation feedback
  Scenario: Registration validation with empty fields
    Given I am on the registration page
    When I submit the registration form with empty fields
    Then I should see validation error messages
    And the form should not be submitted

  # REQ-AUTH-004: Email format validation
  Scenario: Registration with invalid email format
    Given I am on the registration page
    When I enter invalid email format "invalid-email"
    And I fill other required fields
    Then I should see an email validation error
    And registration should not proceed

  # REQ-AUTH-008: Session maintenance across refreshes
  Scenario: Session persistence after page refresh
    Given I am authenticated as "admin"
    When I refresh the browser page
    Then I should remain logged in
    And still have access to the dashboard

  # REQ-AUTH-013: Session data clearing on logout
  Scenario: Session data cleanup on logout
    Given I am authenticated as "admin"
    When I logout
    Then my session data should be cleared
    And I should not be able to access protected resources

  # REQ-AUTH-014: Authentication status check
  Scenario: Authentication status verification
    Given I am authenticated as "admin"
    When I check my authentication status
    Then the system should confirm I am authenticated
    And return my user information

  # REQ-AUTH-009: Clear error messages for invalid credentials
  Scenario: Login error messaging
    Given I am on the login page
    When I enter invalid credentials
    Then I should see a clear error message
    And the message should not reveal specific failure reasons

  # REQ-AUTH-010: Redirect authenticated users to dashboard
  Scenario: Automatic redirect after successful login
    Given I am on the login page
    When I login with valid credentials
    Then I should be automatically redirected to the dashboard
    And see the dashboard content immediately

  # REQ-AUTH-015: Protected endpoints require authentication
  Scenario: Protected resource access control
    Given I am not authenticated
    When I try to access protected API endpoints
    Then access should be denied
    And I should receive unauthorized error responses

  # REQ-AUTH-005: Automatic login after successful registration
  Scenario: Auto-login after registration
    Given I am on the registration page
    When I successfully register a new user
    Then I should be automatically logged in
    And redirected to the dashboard without additional login steps

  # REQ-AUTH-011: Session maintenance
  Scenario: Session management during navigation
    Given I am authenticated as "admin"
    When I navigate between different pages
    Then my authentication should be maintained
    And I should not be asked to login again

  # REQ-AUTH-012: Secure logout functionality
  Scenario: Secure logout process
    Given I am authenticated as "admin"
    When I initiate logout
    Then my session should be securely terminated
    And all authentication tokens should be invalidated
      | email     | different@example.com    |
      | password  | newpassword123          |
    And I click the auth button "Register"
    Then I should see an error message "User already exists"

  # REQ-AUTH-004: Registration validation feedback
  Scenario: Register with missing required fields
    Given I am on the registration page
    When I enter the user data:
      | field     | value      |
      | username  |            |
      | email     |            |
      | password  |            |
    And I click the auth button "Register"
    Then I should see validation error messages for required fields

  # REQ-AUTH-004: Email format validation
  Scenario: Register with invalid email format
    Given I am on the registration page
    When I enter the user data:
      | field     | value          |
      | username  | testuser       |
      | email     | invalid-email  |
      | password  | password123    |
    And I click the auth button "Register"
    Then I should see an error message about invalid email format

  # REQ-AUTH-008: Session maintenance across refreshes
  Scenario: Session persistence after browser refresh
    Given I am authenticated as "admin"
    When I refresh the browser
    Then I should remain authenticated
    And I should still be on the dashboard

  # REQ-AUTH-013: Session data clearing on logout
  Scenario: Session data cleared after logout
    Given I am authenticated as "admin"
    When I logout
    And I try to access the dashboard directly
    Then I should be redirected to the login page
    And my session data should be cleared

  # REQ-AUTH-014: Authentication status check
  Scenario: Check authentication status via API
    Given I am authenticated as "admin"
    When I check my authentication status
    Then the API should confirm I am authenticated
    And it should return my user information

  # REQ-AUTH-009: Clear error messages for invalid credentials
  Scenario: Login with empty credentials
    Given I am on the login page
    When I enter username "" and password ""
    And I click the auth button "Login"
    Then I should see an error message about required fields

  # REQ-AUTH-010: Redirect authenticated users to dashboard
  Scenario: Already authenticated user visits login page
    Given I am authenticated as "admin"
    When I try to visit the login page directly
    Then I should be redirected to the dashboard

  # REQ-AUTH-015: Protected endpoints require authentication
  Scenario: Access protected API endpoint without authentication
    Given I am not authenticated
    When I try to access the products API directly
    Then I should receive an unauthorized error
    And the API should return a 401 status code

  # REQ-AUTH-005: Automatic login after successful registration
  Scenario: Automatic login after registration
    Given I am on the registration page
    When I enter the user data:
      | field     | value                     |
      | username  | autouser                  |
      | email     | autouser@example.com      |
      | password  | autopassword123          |
    And I click the auth button "Register"
    Then I should be automatically logged in
    And I should be redirected to the dashboard
    And I should see the message "Dashboard - Welcome autouser"

  # REQ-AUTH-011: Session maintenance
  Scenario: Session maintained during navigation
    Given I am authenticated as "admin"
    When I navigate between different pages
    Then my session should remain active
    And I should not need to login again

  # REQ-AUTH-012: Secure logout functionality
  Scenario: Secure logout process
    Given I am authenticated as "admin"
    When I click the "Logout" button
    Then my session should be destroyed on the server
    And I should be logged out completely
    And any sensitive data should be cleared from the client