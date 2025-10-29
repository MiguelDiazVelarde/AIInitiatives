# language: en
Feature: Data Validation and Security
  As a system administrator
  I want to ensure data integrity and security
  So that the application is safe and reliable

  Background:
    Given the application is running at "http://localhost:3000"

  # REQ-DATA-001: Client and server-side validation
  Scenario: Dual validation on client and server
    Given I am on the registration page
    When I submit invalid data that passes client validation somehow
    Then the server should still validate the data
    And reject invalid submissions
    And return appropriate error messages

  # REQ-DATA-002: Input sanitization
  Scenario: Input sanitization prevents injection
    Given I am authenticated as "admin"
    When I try to enter potentially malicious data in product fields:
      | field       | malicious_input           |
      | name        | <script>alert('xss')</script> |
      | description | DROP TABLE products;      |
    Then the input should be sanitized
    And no malicious code should be executed
    And the data should be stored safely

  # REQ-DATA-003: Data type constraints
  Scenario: Data type validation enforcement
    Given I am creating a new product
    When I enter data with wrong types:
      | field | value     | expected_type |
      | price | "abc"     | number        |
      | stock | "xyz"     | integer       |
    Then the system should reject the invalid types
    And provide clear error messages about expected types

  # REQ-DATA-004: Email format validation
  Scenario: Email format validation
    Given I am on the registration page
    When I enter invalid email formats:
      | email                |
      | invalid-email        |
      | @domain.com         |
      | user@               |
      | user space@test.com |
    Then each should be rejected with appropriate error messages
    When I enter valid email formats:
      | email                |
      | user@domain.com      |
      | test.email@test.org  |
      | valid+email@test.co.uk |
    Then each should be accepted

  # REQ-SEC-001: Password encryption with bcrypt
  Scenario: Password encryption verification
    Given I register a new user with password "mypassword123"
    Then the password should be stored as a bcrypt hash
    And the original password should not be stored in plain text
    And the hash should be different each time for the same password

  # REQ-SEC-002: Secure session management
  Scenario: Session security measures
    Given I am authenticated as "admin"
    Then my session should have a secure session ID
    And session data should be protected
    When I logout
    Then the session should be completely destroyed
    And session data should be cleared from server

  # REQ-SEC-003: Input validation and sanitization
  Scenario: Comprehensive input sanitization
    Given I am submitting any form in the application
    When I include various types of potentially harmful input
    Then all inputs should be validated and sanitized
    And harmful content should be neutralized
    And the application should remain secure

  # REQ-SEC-004: Protection against common vulnerabilities
  Scenario: XSS protection
    Given I am entering data in any form field
    When I try to inject JavaScript code
    Then the code should be sanitized or escaped
    And not executed in the browser
    And other users should not be affected

  Scenario: CSRF protection measures
    Given I am performing state-changing operations
    When requests are made to the server
    Then appropriate CSRF protection should be in place
    And unauthorized requests should be blocked

  # REQ-SEC-005: Authentication enforcement
  Scenario: Comprehensive authentication enforcement
    Given I am not authenticated
    When I try to access any protected resource:
      | endpoint           |
      | /api/products      |
      | /api/products/123  |
      | /dashboard         |
    Then each request should be rejected
    And I should receive unauthorized error responses
    And be redirected to login when appropriate

  # REQ-DATA-005: Password encryption verification
  Scenario: Password encryption strength
    Given I am registering with different passwords
    When I use various password strengths
    Then all passwords should be encrypted with bcrypt
    And the encryption should use appropriate salt rounds
    And the hashes should be resistant to common attacks

  # REQ-DATA-006: Data consistency during operations
  Scenario: Data consistency maintenance
    Given I have products in the system
    When I perform multiple operations simultaneously
    Then data consistency should be maintained
    And no data corruption should occur
    And all operations should complete reliably

  # REQ-DATA-007: Unique identifier enforcement
  Scenario: Unique ID generation and enforcement
    Given I am creating multiple entities
    When users and products are created
    Then each should have a unique identifier
    And no ID collisions should occur
    And IDs should be properly formatted

  # REQ-DATA-008: Audit trail timestamps
  Scenario: Timestamp recording for audit trails
    Given I am performing any data operation
    When I create, update, or delete entities
    Then appropriate timestamps should be recorded
    And the timestamps should be accurate
    And include creation and modification times

  # Data integrity validation
  Scenario: Product data integrity
    Given I am managing products
    When I create a product with specific data
    Then all data should be stored accurately
    And retrieved without modification
    And maintain integrity across operations

  # Session hijacking prevention
  Scenario: Session security measures
    Given I have an active session
    When potential session hijacking attempts occur
    Then the session should remain secure
    And unauthorized access should be prevented
    And legitimate users should not be affected

  # Input length and boundary validation
  Scenario: Input boundary validation
    Given I am entering data in form fields
    When I enter extremely long text:
      | field       | length |
      | name        | 1000   |
      | description | 5000   |
      | username    | 100    |
    Then appropriate length limits should be enforced
    And users should be informed of the limits
    And the application should handle boundary cases gracefully

  # SQL injection prevention (even though using in-memory storage)
  Scenario: Injection attack prevention
    Given I am entering data that resembles SQL injection
    When I submit forms with potential injection payloads
    Then the application should safely handle the input
    And no system compromise should occur
    And data should be processed safely

  # Cross-site scripting (XSS) prevention
  Scenario: XSS attack prevention in all contexts
    Given I am entering potentially malicious scripts
    When I submit data containing JavaScript, HTML, or other executable code
    Then the content should be properly escaped or sanitized
    And no scripts should execute in other users' browsers
    And the application should remain secure for all users