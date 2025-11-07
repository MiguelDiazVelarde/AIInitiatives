@session-persistence
Feature: Session Persistence Testing
  Testing session persistence after browser refresh

  # REQ-AUTH-008: Session maintenance across refreshes
  Scenario: Session persistence after browser refresh
    Given I am authenticated as "admin"
    When I refresh the browser
    Then I should remain authenticated
    And I should still be on the dashboard