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