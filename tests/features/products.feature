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
    And I click "Add Product"
    Then the product "Gaming Laptop" should be created successfully
    And it should display all the entered information correctly

  # REQ-PROD-003: Price validation (positive numbers)
  Scenario: Add product with invalid price
    Given I am on the dashboard
    When I complete the product form with:
      | field       | value                    |
      | name        | Invalid Product          |
      | description | Product with bad price   |
      | price       | -50.00                   |
      | category    | electronics              |
      | stock       | 10                       |
    And I click "Add Product"
    Then I should see a validation error for the price field
    And the product should not be created

  # REQ-PROD-003: Stock validation (non-negative integer)
  Scenario: Add product with invalid stock
    Given I am on the dashboard
    When I complete the product form with:
      | field       | value                    |
      | name        | Invalid Stock Product    |
      | description | Product with bad stock   |
      | price       | 29.99                    |
      | category    | electronics              |
      | stock       | -5                       |
    And I click "Add Product"
    Then I should see a validation error for the stock field
    And the product should not be created

  # REQ-PROD-005: Unique ID assignment
  Scenario: Multiple products have unique IDs
    Given I am on the dashboard
    When I add multiple products:
      | name      | description | price | category | stock |
      | Product A | Description A | 10.00 | books   | 5     |
      | Product B | Description B | 20.00 | books   | 10    |
    Then each product should have a unique identifier
    And both products should appear in the list

  # REQ-PROD-006: Creation timestamp and creator tracking
  Scenario: Product creation metadata
    Given I am authenticated as "admin"
    And I am on the dashboard
    When I add a new product "Timestamped Product"
    Then the product should have a creation timestamp
    And the product should be associated with the current user

  # REQ-PROD-008: Product information display
  Scenario: Product display includes all information
    Given there is a product "Complete Info Product" with all details
    When I view the product list
    Then I should see the product name "Complete Info Product"
    And I should see the product description
    And I should see the formatted price
    And I should see the category
    And I should see the stock quantity

  # REQ-PROD-009: Responsive grid layout
  Scenario: Product list responsive layout
    Given there are multiple products in the list
    When I view the product list on different screen sizes
    Then the products should be displayed in a responsive grid
    And all product information should remain accessible

  # REQ-PROD-010: Empty state message
  Scenario: Empty product list display
    Given there are no products
    When I view the dashboard
    Then I should see a message "No products registered."
    And I should see encouragement to "Add your first product!"

  # REQ-PROD-011: Real-time list updates
  Scenario: Product list updates after operations
    Given I have products in the list
    When I add a new product
    Then the product list should update immediately
    And the new product should appear without refreshing the page

  # REQ-PROD-013: Delete confirmation
  Scenario: Product deletion requires confirmation
    Given there is a product "Confirm Delete Product" in the list
    When I click the delete button for the product
    Then I should see a confirmation dialog
    And the dialog should ask if I'm sure about deletion
    And I should have options to confirm or cancel

  # REQ-PROD-016: Graceful deletion error handling
  Scenario: Handle deletion errors gracefully
    Given there is a product "Error Product" in the list
    When the delete operation fails due to server error
    Then I should see an appropriate error message
    And the product should remain in the list
    And the application should remain functional

  # REQ-PROD-004: Form validation feedback
  Scenario: Comprehensive form validation feedback
    Given I am on the dashboard
    When I submit the product form with invalid data:
      | field       | value    | issue           |
      | name        |          | empty           |
      | description |          | empty           |
      | price       | abc      | not a number    |
      | category    |          | not selected    |
      | stock       | -1       | negative        |
    Then I should see specific validation messages for each field
    And the form should highlight the problematic fields
    And submission should be prevented

  # REQ-PROD-007: Product counter display
  Scenario: Product counter shows correct count
    Given I have 3 products in the list
    When I view the dashboard
    Then the product counter should show "(3)"
    When I add another product
    Then the product counter should update to "(4)"
    When I delete a product
    Then the product counter should update to "(3)"

  # Category validation scenarios
  Scenario Outline: Valid category selection
    Given I am on the dashboard
    When I select category "<category>" from the dropdown
    Then the category should be accepted
    And I should be able to create a product with that category

    Examples:
      | category    |
      | electronics |
      | clothing    |
      | books       |
      | home        |
      | sports      |
      | other       |

  # REQ-PROD-015: Successful deletion updates display
  Scenario: Product removal from display after deletion
    Given there are 5 products in the list
    When I delete product "Middle Product"
    And I confirm the deletion
    Then the product "Middle Product" should disappear from the list
    And the remaining 4 products should still be visible
    And the product counter should reflect the new count

  # Form reset after successful submission
  Scenario: Form resets after successful product creation
    Given I am on the dashboard
    When I complete the product form with valid data
    And I submit the form successfully
    Then the form fields should be cleared
    And the form should be ready for the next product entry

  # Data persistence and consistency
  Scenario: Product data consistency
    Given I add a product with specific details
    When I refresh the page
    Then the product should still appear with the same details
    And all information should be preserved accurately