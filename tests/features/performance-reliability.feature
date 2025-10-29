# language: en
Feature: Performance and Reliability
  As a system user
  I want the application to be fast and reliable
  So that I can work efficiently without interruptions

  Background:
    Given the application is running at "http://localhost:3000"

  # REQ-PERF-001: Response time under normal load
  Scenario: User interactions respond within 2 seconds
    Given I am using the application under normal conditions
    When I perform any user interaction:
      | action              |
      | clicking buttons    |
      | submitting forms    |
      | navigating pages    |
      | loading product list|
    Then each interaction should respond within 2 seconds
    And the user experience should feel responsive

  # REQ-PERF-002: Dashboard loading performance
  Scenario: Dashboard loads within 3 seconds for authenticated users
    Given I am an authenticated user
    When I navigate to the dashboard
    Then the dashboard should load completely within 3 seconds
    And all essential elements should be visible
    And the product list should be populated

  # REQ-PERF-003: Concurrent user session handling
  Scenario: Multiple user sessions performance
    Given multiple users are accessing the application simultaneously
    When each user performs typical operations
    Then the application should handle all sessions efficiently
    And response times should remain acceptable
    And no user should experience significant delays

  # REQ-PERF-004: API response optimization
  Scenario: Optimized API responses for minimal data transfer
    Given I am making API requests
    When I request product data or user information
    Then the API should return only necessary data
    And response sizes should be optimized
    And unnecessary data should not be transmitted

  # REQ-REL-001: Graceful error handling without crashes
  Scenario: Application stability during errors
    Given I am using the application
    When various types of errors occur:
      | error_type          |
      | network failures    |
      | invalid input       |
      | server errors       |
      | timeout conditions  |
    Then the application should handle each error gracefully
    And should not crash or become unresponsive
    And should provide appropriate feedback to users

  # REQ-REL-002: Meaningful error messages
  Scenario: User-friendly error communication
    Given I encounter errors while using the application
    When any error occurs
    Then I should receive clear, meaningful error messages
    And the messages should help me understand what went wrong
    And guide me on how to resolve the issue
    And avoid technical jargon when possible

  # REQ-REL-003: Data integrity during operations
  Scenario: Data integrity maintenance
    Given I am performing data operations
    When I create, update, or delete products or user data
    Then data integrity should be maintained throughout
    And no data corruption should occur
    And all related data should remain consistent

  # REQ-REL-004: Recovery from network interruptions
  Scenario: Network interruption recovery
    Given I am using the application
    When network connectivity is temporarily lost
    And then restored
    Then the application should detect the connectivity restoration
    And allow me to retry failed operations
    And maintain my session and data where possible

  # Performance under load scenarios
  Scenario: Application performance with many products
    Given the system contains a large number of products
    When I view the product list
    Then the list should load efficiently
    And scrolling should remain smooth
    And search/filter operations should be responsive

  # Memory usage and resource management
  Scenario: Efficient resource usage
    Given I am using the application for extended periods
    When I perform many operations over time
    Then memory usage should remain stable
    And the application should not slow down over time
    And resources should be managed efficiently

  # Form submission performance
  Scenario: Fast form processing
    Given I am submitting forms with various data sizes
    When I submit registration, login, or product forms
    Then each submission should process quickly
    And provide immediate feedback on success or failure
    And not leave users waiting without indication

  # Page navigation performance
  Scenario: Quick page transitions
    Given I am navigating between application pages
    When I move from login to registration to dashboard
    Then each transition should be smooth and fast
    And users should not experience noticeable delays
    And the interface should remain responsive during transitions

  # Error recovery scenarios
  Scenario: Recovery from server errors
    Given the server encounters temporary issues
    When I attempt operations that fail due to server problems
    Then I should be informed of the issue clearly
    And be able to retry the operation when the server recovers
    And my progress should be preserved where possible

  # Session timeout handling
  Scenario: Graceful session timeout handling
    Given I have been inactive for a period
    When my session expires
    Then I should be notified appropriately
    And redirected to login without losing my work context
    And be able to resume after re-authentication

  # Browser compatibility performance
  Scenario: Consistent performance across browsers
    Given I am using different web browsers
    When I access the application from Chrome, Firefox, Safari, or Edge
    Then performance should be consistent across all browsers
    And all features should work reliably
    And response times should be similar

  # Concurrent operations handling
  Scenario: Multiple simultaneous operations
    Given I am performing multiple operations at once
    When I submit forms while loading data or navigating
    Then the application should handle concurrent operations gracefully
    And not interfere with each other
    And maintain data consistency

  # Large dataset handling
  Scenario: Handling large amounts of data
    Given the application contains substantial amounts of data
    When I view lists or perform searches
    Then the application should remain responsive
    And implement appropriate pagination or limiting
    And not overwhelm the user interface

  # Real-time updates performance
  Scenario: Efficient real-time updates
    Given I am viewing dynamic content like product lists
    When data changes occur (additions, deletions, updates)
    Then updates should be reflected quickly in the UI
    And without requiring full page refreshes
    And without causing interface disruption

  # Mobile device performance
  Scenario: Performance on mobile devices
    Given I am accessing the application from mobile devices
    When I perform typical operations
    Then the application should remain responsive on mobile
    And not consume excessive device resources
    And provide a smooth mobile experience

  # Offline capability and sync
  Scenario: Graceful offline handling
    Given I am using the application
    When connectivity is lost temporarily
    Then the application should inform me of the offline state
    And allow limited functionality where possible
    And sync changes when connectivity is restored