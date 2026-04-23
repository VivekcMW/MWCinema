Feature: Real-time feed integration
  As an ad-ops user
  I want to see the freshness of cinema data feeds
  So that I know inventory reflects the real world

  @smoke
  Scenario: Feed-status indicator in the top bar
    When I look at the top bar
    Then I should see a "Feed: Healthy" or "Feed: Stale" pill with a "last synced" timestamp

  Scenario: Manual refresh triggers a sync
    When I click the feed-status pill
    Then a sync should be triggered and the timestamp should update to "just now"

  Scenario: Per-source health is visible on hover
    When I hover the feed-status pill
    Then I should see each configured cinema feed with its individual status

  Scenario: Stale feed raises a warning in Ad Slots
    Given the "Novo Cinemas feed" is stale
    When I open the Ad Slots page
    Then a subtle warning banner should indicate that one or more feeds are stale
