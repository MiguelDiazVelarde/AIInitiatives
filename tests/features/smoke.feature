# language: en
Feature: Basic functionality smoke test
  As a developer
  I want to verify that the application works
  So that I can ensure tests are configured correctly

  Scenario: Verify application responds
    Given the application is running at "http://localhost:3000"
    When I navigate to the main page
    Then I should be redirected to the login page

  Scenario: Basic functional login
    Given the application is running at "http://localhost:3000"
    And I am on the login page
    When I enter username "admin" and password "password"
    And I click the "Iniciar Sesión" button
    Then I should be redirected to the dashboard