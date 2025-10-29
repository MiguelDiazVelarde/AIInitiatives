# language: en
Feature: User Authentication
  As an application user
  I want to be able to login and register
  So that I can access the application functionalities

  Background:
    Given the application is running at "http://localhost:3000"

  Scenario: Login with valid credentials
    Given I am on the login page
    When I enter username "admin" and password "password"
    And I click the auth button "Login"
    Then I should be redirected to the dashboard
    And I should see the message "Dashboard - Welcome admin"

  Scenario: Login with invalid credentials
    Given I am on the login page
    When I enter username "wrong_user" and password "wrong_password"
    And I click the auth button "Login"
    Then I should see an error message "Invalid credentials"

  Scenario: Register new user
    Given I am on the registration page
    When I enter the user data:
      | field     | value                  |
      | username  | new_user               |
      | email     | new@example.com        |
      | password  | secure_password        |
    And I click the auth button "Register"
    Then I should be redirected to the dashboard
    And I should see the message "Dashboard - Welcome new_user"

  Scenario: Register with existing user
    Given I am on the registration page
    When I enter the user data:
      | field     | value              |
      | username  | admin              |
      | email     | admin@example.com  |
      | password  | password           |
    And I click the auth button "Register"
    Then I should see an error message "User already exists"

  Scenario: Logout
    Given I am authenticated as "admin"
    When I click the "Logout" button
    Then I should be redirected to the login page
    And I should not have access to the dashboard

  Scenario: Unauthorized access to dashboard
    Given I am not authenticated
    When I try to access the dashboard directly
    Then I should be redirected to the login page

  # REQ-AUTH-002: Username and email uniqueness validation
  Scenario: Register with duplicate username
    Given I am on the registration page
    When I enter the user data:
      | field     | value                    |
      | username  | admin                    |
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