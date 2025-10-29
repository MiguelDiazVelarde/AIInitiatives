# language: en
Feature: Product Management
  As an authenticated user
  I want to be able to manage products
  So that I can maintain an updated inventory

  Background:
    Given the application is running at "http://localhost:3000"
    And I am authenticated as "admin"

  Scenario: Add a new product
    Given I am on the dashboard
    When I complete the product form with:
      | field       | value                           |
      | name        | iPhone 15 Pro                   |
      | description | Apple smartphone latest generation |
      | price       | 999.99                          |
      | category    | electronics                     |
      | stock       | 50                              |
    And I click "Add Product"
    Then the product "iPhone 15 Pro" should appear in the list
    And it should show the price "$999.99"
    And it should show the stock "50"

  Scenario: View empty product list
    Given there are no registered products
    When I am on the dashboard
    Then I should see the message "No products registered."
    And the product counter should show "(0)"

  Scenario: View product list with items
    Given there are registered products
    When I am on the dashboard
    Then I should see the product list
    And the counter should show the correct number of products

  Scenario: Delete an existing product
    Given there is a product "Test Product" in the list
    When I click the "Delete" button for product "Test Product"
    And I confirm the deletion in the dialog
    Then the product "Test Product" should not appear in the list
    And the product counter should decrease

  Scenario: Cancel product deletion
    Given there is a product "Test Product" in the list
    When I click the "Delete" button for product "Test Product"
    And I cancel the deletion in the dialog
    Then the product "Test Product" should remain in the list

  Scenario: Required fields validation
    Given I am on the dashboard
    When I try to submit the form without completing required fields
    Then I should see validation messages for required fields
    And the product should not be added

  Scenario Outline: Add products from different categories
    Given I am on the dashboard
    When I complete the form with category "<category>"
    And I add a product "<name>"
    Then the product should appear with category "<category>"

    Examples:
      | category    | name           |
      | electronics | Dell Laptop    |
      | clothing    | Nike T-shirt   |
      | books       | Clean Code     |
      | home        | Dining Table   |
      | sports      | Soccer Ball    |
      | other       | Misc Item      |