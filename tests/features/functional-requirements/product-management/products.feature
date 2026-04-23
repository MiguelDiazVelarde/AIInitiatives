# language: en
Feature: Product Management
  As an authenticated user
  I want to manage products
  So that I can maintain my product catalog

  Background:
    Given I am authenticated as "admin"

  # REQ-PROD-002: Product field validation
  Scenario: Add product with all required fields
    Given I am on the dashboard
    When I complete the product form with:
      | field       | value                    |
      | name        | Gaming Laptop            |
      | description | High-performance laptop  |
      | price       | 1299.99                  |
      | category    | electronics              |
      | stock       | 25                       |
    And I submit the product form
    Then the product should be created successfully
    And should appear in the product list

  # REQ-PROD-003: Price validation (positive numbers)
  Scenario: Add product with invalid price
    Given I am on the dashboard
    When I complete the product form with:
      | field       | value           |
      | name        | Invalid Product |
      | description | Test product    |
      | price       | -10.99          |
      | category    | electronics     |
      | stock       | 5               |
    And I submit the product form
    Then I should see a price validation error
    And the product should not be created

  # REQ-PROD-003: Stock validation (non-negative integer)
  Scenario: Add product with invalid stock
    Given I am on the dashboard
    When I complete the product form with:
      | field       | value           |
      | name        | Invalid Stock   |
      | description | Test product    |
      | price       | 29.99           |
      | category    | electronics     |
      | stock       | -5              |
    And I submit the product form
    Then I should see a stock validation error
    And the product should not be created

  # REQ-PROD-005: Unique ID assignment
  Scenario: Multiple products have unique IDs
    Given I have created multiple products
    When I check the product identifiers
    Then each product should have a unique ID
    And no ID collisions should exist

  # REQ-PROD-006: Creation timestamp and creator tracking
  Scenario: Product creation metadata
    Given I am on the dashboard
    When I create a new product
    Then the product should include creation timestamp
    And should record the creator information

  # REQ-PROD-008: Product information display
  Scenario: Product display includes all information
    Given I have products in the system
    When I view the product list
    Then each product should display name, description, price, category, and stock
    And all information should be clearly formatted

  # REQ-PROD-009: Responsive grid layout
  Scenario: Product list responsive layout
    Given I have multiple products in the system
    When I view the product list on different screen sizes
    Then products should be displayed in a responsive grid
    And layout should adapt to screen dimensions

  # REQ-PROD-010: Empty state message
  Scenario: Empty product list display
    Given I have no products in the system
    When I view the product list
    Then I should see an appropriate empty state message
    And guidance on how to add the first product

  # REQ-PROD-011: Real-time list updates
  Scenario: Product list updates after operations
    Given I am viewing the product list
    When I add or delete a product
    Then the list should update immediately
    And reflect the changes without requiring a page refresh

  # REQ-PROD-013: Delete confirmation
  Scenario: Product deletion requires confirmation
    Given I have products in the system
    When I attempt to delete a product
    Then I should see a confirmation dialog
    And be able to confirm or cancel the deletion

  # REQ-PROD-014: Edit product - open form pre-filled
  Scenario: Edit button opens form pre-filled with product data
    Given there is a product "Laptop Pro" with all details
    When I click the edit button for the product "Laptop Pro"
    Then the product form should open in edit mode
    And the form should be pre-filled with the product data

  # REQ-PROD-014: Edit product - save changes successfully
  Scenario: Successfully update product information
    Given there is a product "Old Name" with all details
    When I click the edit button for the product "Old Name"
    And I update the product name to "New Name"
    And I submit the product form
    Then the product "New Name" should appear in the product list
    And the product "Old Name" should not appear in the list

  # REQ-PROD-014: Edit product - cancel edit
  Scenario: Cancel editing restores original product data
    Given there is a product "Original Product" with all details
    When I click the edit button for the product "Original Product"
    And I cancel the product form
    Then the product "Original Product" should still appear in the list
    And the form should be closed

  # REQ-PROD-014: Edit product - real-time update without reload
  Scenario: Product list updates immediately after edit
    Given there is a product "Update Me" with all details
    When I edit the product "Update Me" changing the price to "999.99"
    Then the updated price "$999.99" should appear in the product list
    And the page should not have been reloaded

  # REQ-PROD-016: Graceful deletion error handling
  Scenario: Handle deletion errors gracefully
    Given I have products in the system
    When deletion fails due to an error
    Then I should see an appropriate error message
    And the product should remain in the list

  # REQ-PROD-004: Form validation feedback
  Scenario: Comprehensive form validation feedback
    Given I am on the dashboard
    When I submit the product form with missing or invalid data
    Then I should see specific validation errors for each field
    And clear guidance on how to correct the errors
    And the form should prevent submission until valid

  # REQ-PROD-007: Product counter display
  Scenario: Product counter shows correct count
    Given I have products in the system
    When I view the dashboard
    Then the product counter should show the correct number of products
    And update when products are added or removed

  # REQ-PROD-015: Successful deletion updates display
  Scenario: Product removal from display after deletion
    Given I have a product in the system
    When I successfully delete the product
    Then it should be immediately removed from the display
    And the product count should be updated