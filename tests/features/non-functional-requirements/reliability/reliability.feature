Feature: System Reliability
  As a user of the application
  I want the system to be reliable and handle errors gracefully
  So that I can use the application without unexpected failures

  Background:
    Given the application is running
    And I have access to the system

  @error-handling
  Scenario: Graceful error handling without system crashes
    Given the system encounters an unexpected error
    When the error occurs during normal operation
    Then the system should not crash
    And should continue to function for other operations
    And log the error appropriately

  @error-handling
  Scenario: Meaningful error messages for users
    Given I am performing an operation that fails
    When the system encounters an error
    Then I should receive a clear, user-friendly error message
    And the message should guide me on how to resolve the issue
    And technical details should not be exposed

  @error-handling
  Scenario: Network timeout error handling
    Given I am submitting a form
    When the network request times out
    Then the system should display a timeout error message
    And allow me to retry the operation
    And not lose my form data

  @error-handling
  Scenario: Server error response handling
    Given the server returns a 500 error
    When I perform any API operation
    Then the client should handle the error gracefully
    And display an appropriate error message
    And not break the user interface

  @data-integrity
  Scenario: Data integrity during concurrent operations
    Given multiple users are accessing the system
    When they perform operations on the same data simultaneously
    Then the system should maintain data consistency
    And prevent data corruption
    And handle race conditions appropriately

  @data-integrity
  Scenario: Transaction rollback on failure
    Given I am performing a multi-step operation
    When one step of the operation fails
    Then the system should rollback all changes
    And maintain the previous consistent state
    And inform me about the failure

  @data-integrity
  Scenario: Data validation consistency
    Given I submit data through different interfaces
    When the same validation rules apply
    Then the system should enforce rules consistently
    And prevent invalid data from being stored

  @network-reliability
  Scenario: Recovery from network interruptions during login
    Given I am logging into the system
    When the network connection is interrupted
    Then the system should detect the interruption
    And allow me to retry the login
    And not leave me in an inconsistent authentication state

  @network-reliability
  Scenario: Recovery from network interruptions during product creation
    Given I am creating a new product
    When the network connection is interrupted before completion
    Then the system should handle the interruption gracefully
    And allow me to retry the operation
    And not create duplicate products

  @network-reliability
  Scenario: Automatic retry mechanism for failed requests
    Given a network request fails temporarily
    When the system detects the failure
    Then it should automatically retry the request
    And succeed when the network is restored
    And inform me about the retry process

  @session-reliability
  Scenario: Session persistence across browser refreshes
    Given I am logged into the system
    When I refresh the browser page
    Then my session should remain active
    And I should not need to log in again
    And my authentication state should be preserved

  @session-reliability
  Scenario: Graceful session expiration handling
    Given my session has expired
    When I try to perform an authenticated operation
    Then the system should detect the expired session
    And redirect me to the login page
    And preserve the operation I was trying to perform

  @performance-reliability
  Scenario: System performance under normal load
    Given the system is under normal user load
    When users perform typical operations
    Then response times should remain acceptable
    And the system should not degrade significantly
    And all features should remain functional

  @performance-reliability
  Scenario: Memory leak prevention
    Given the application runs for extended periods
    When users perform various operations over time
    Then memory usage should remain stable
    And the application should not consume excessive resources
    And performance should not degrade over time

  @backup-reliability
  Scenario: Data backup and recovery procedures
    Given the system has important user data
    When a backup operation is performed
    Then all critical data should be backed up
    And the backup should be restorable
    And data integrity should be maintained during backup

  @monitoring-reliability
  Scenario: System health monitoring
    Given the application is running in production
    When system health checks are performed
    Then all critical components should be monitored
    And alerts should be generated for failures
    And system status should be accurately reported