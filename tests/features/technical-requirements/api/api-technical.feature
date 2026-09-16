# language: en
Feature: API Technical Requirements
  As a developer or system integrator
  I want the API to be well-designed and technically sound
  So that it can be integrated and maintained effectively

  Background:
    Given the application is running at "http://localhost:3000"

  # REQ-API-001: Authentication endpoints implementation
  Scenario: Authentication API endpoints availability
    Given the API server is running
    When I check the authentication endpoints
    Then the following endpoints should be available:
      | method | endpoint           | description                  |
      | POST   | /api/auth/login    | User login                   |
      | POST   | /api/auth/register | User registration            |
      | POST   | /api/auth/logout   | User logout                  |
      | GET    | /api/auth/me       | Check authentication status  |

  # REQ-API-002: Course and progress management endpoints
  Scenario: Course and progress API endpoints availability
    Given the API server is running
    And I am authenticated
    When I check the course and progress endpoints
    Then the following endpoints should be available:
      | method | endpoint              | description                |
      | GET    | /api/courses          | Get all courses            |
      | GET    | /api/courses/:id      | Get course by ID           |
      | POST   | /api/progress         | Register study progress    |
      | GET    | /api/progress         | Get progress entries       |
      | GET    | /api/progress/stats   | Get aggregated statistics  |

  # REQ-API-003: Consistent JSON response format
  Scenario: Consistent API response structure
    Given I am making various API requests
    When I call any API endpoint
    Then all responses should follow a consistent JSON format
    And include appropriate status information
    And provide consistent error messaging structure

  # REQ-API-004: Proper HTTP status codes
  Scenario: Correct HTTP status codes for different scenarios
    Given I am testing various API scenarios
    When I make requests with different conditions:
      | scenario                    | expected_status |
      | successful login            | 200             |
      | successful registration     | 201             |
      | invalid credentials         | 401             |
      | missing required fields     | 400             |
      | resource not found          | 404             |
      | unauthorized access         | 401             |
      | server error               | 500             |
    Then each should return the appropriate HTTP status code