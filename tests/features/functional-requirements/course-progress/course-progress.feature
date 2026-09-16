# language: en
Feature: Course Catalog and Progress Tracking
  As an authenticated student
  I want to browse courses and register my study progress
  So that I can track my learning applying Barbara Oakley's techniques

  Background:
    Given I am authenticated as "admin"

  # REQ-COURSE-001: Course catalog display
  Scenario: View the course catalog
    Given I am on the dashboard
    Then I should see the course "English with AI"
    And I should see the course "Portuguese with AI"
    And I should see the course "TypeScript and Playwright Development"
    And I should see the course "AI Engineering"

  # REQ-COURSE-002: Course syllabus detail
  Scenario: Expand a course syllabus
    Given I am on the dashboard
    When I open the syllabus for the course "English with AI"
    Then I should see its modules with objectives and content

  # REQ-PROGRESS-001: Register a study session
  Scenario: Register study progress for a course
    Given I am on the dashboard
    When I register progress for the course "AI Engineering" with:
      | minutesStudied | 45              |
      | status         | completed       |
      | notes          | Automated test session |
    Then the progress entry should be saved successfully
    And I should be taken to the statistics view

  # REQ-PROGRESS-002: Statistics reflect registered progress
  Scenario: View updated statistics after registering progress
    Given I have registered at least one study session
    When I view my statistics
    Then I should see the total number of sessions
    And I should see the total minutes studied
    And I should see my study streak

  # REQ-PROGRESS-003: Switch between views
  Scenario: Toggle between courses and statistics views
    Given I am on the dashboard
    When I switch to the statistics view
    Then I should see the statistics panel
    When I switch to the courses view
    Then I should see the course catalog

  # REQ-PROGRESS-004: Minutes studied is required
  Scenario: Progress form requires minutes studied
    Given I am on the dashboard
    When I open the progress form for the course "Portuguese with AI"
    And I try to submit the progress form without entering minutes studied
    Then the progress form should still be visible
