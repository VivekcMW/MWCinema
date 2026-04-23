Feature: Audience-based planning
  As a media planner
  I want to target pre-defined audience packages
  So that I can plan at the audience layer instead of raw inventory

  @unit
  Scenario: Select a predefined audience package
    When I select the audience package "Affluent"
    Then the Targeting step should pre-fill genres "Drama, Sci-Fi"
    And cinema types "Luxury, Ultra-Luxury"
    And daypart "Evening"
    And show an estimated reach on the summary panel

  Scenario: Audience package remains filterable by location
    Given I selected the audience package "Families"
    When I apply an emirate filter for "Dubai"
    Then only Dubai theaters mapped to the Families package should be included

  Scenario: Switching packages resets derived filters
    Given I selected the audience package "Youth"
    When I switch to "Affluent"
    Then genres, cinema types and dayparts should update to the Affluent defaults

  Scenario: Audience pack estimate appears in Review
    Given I selected the audience package "Youth"
    When I reach the "Review & submit" step
    Then the Review summary should show the audience name and estimated reach
