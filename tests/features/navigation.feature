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