Feature: Dynamic ad slot generation
  As a programmatic system
  I want ad slots to be generated from live showtimes
  So that availability reflects actual cinema schedules

  Scenario: Pre-show slots appear for every scheduled session
    Given a session is scheduled for 9:00 PM
    Then a "Pre-show 60s" slot should exist starting before the show
    And a "Pre-show 30s" slot should exist immediately before the feature

  Scenario: Interval slots only appear for long films
    Given a session for "Avatar: Fire and Ash"
    Then an "Interval" slot should be generated for that session
    And films shorter than 2h 20m should not generate interval slots

  @unit
  Scenario: Tiered pricing by proximity to the feature
    Then the Pre-show 60s slot should be priced higher (tier 1) than the 30s slot (tier 2)
    And the interval slot should be the lowest-priced tier (tier 3)

  Scenario: Only active slots are visible
    Given an ad slot has already played
    When I open the Ad Slots page
    Then expired slots should not be visible for new booking
