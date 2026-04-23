Feature: Cinema type targeting
  As a media planner
  I want to target cinema formats
  So that I can align campaigns with audience segments

  @smoke
  Scenario: Target only luxury cinemas
    Given cinemas are categorised by type
    When I filter targeting by "Luxury"
    Then only luxury cinemas should remain in the targeting summary

  Scenario: Target only IMAX screens
    When I filter targeting by "IMAX"
    Then only theaters offering IMAX should remain

  Scenario: Combine location and cinema type
    When I select the emirate "Dubai"
    And I filter targeting by "Luxury"
    Then only Dubai luxury cinemas should remain

  Scenario: Cinema type carries through to booking
    Given I have selected "IMAX" cinemas only
    When I advance to the "Screen" step
    Then the recommended bundle and slot picker should only list IMAX-capable screens
