Feature: Non-deterministic scheduling
  As a programmatic system
  I want to adapt to changing cinema showtimes
  So that campaigns remain accurate across theaters and days

  Scenario: Ad slot timing changes daily
    Given a theater schedules a show at 9:00 PM today
    And the same show at 9:15 PM tomorrow
    When I view the Week calendar in Ad Slots
    Then the corresponding slot should appear at each day's actual start time

  @smoke
  Scenario: Schedule refresh propagates at scale
    Given the schedule feed is updated for 40 theaters
    When I click "Refresh feed"
    Then the Ad Slots calendars should re-render with the new times
    And the "Last synced" indicator should update

  Scenario: Schedule change removes stale slots
    Given an ad slot existed at 9:00 PM yesterday
    When the schedule for today removes that session
    Then the slot should disappear from today's calendar
