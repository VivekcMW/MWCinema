Feature: Location-based cinema planning
  As a media planner
  I want to target cinema inventory by hierarchical location
  So that I can run geographically relevant campaigns

  Background:
    Given I am on the "New campaign" wizard
    And I am on the "Targeting" step

  Scenario: Target specific theaters in a city centre
    Given cinema inventory is tagged with emirate, city and zone
    When I select the zone "City Center"
    And I select the city "Dubai"
    Then only theaters in Dubai city centre should appear in the selection summary

  Scenario: Target all small towns in an emirate
    Given cinema inventory includes urban and small-town classifications
    When I select the zone "Small Town"
    And I select the emirate "Ras Al Khaimah"
    Then only theaters classified as small towns in RAK should be included

  @smoke
  Scenario: Target national small-town inventory
    When I select the zone "Small Town" with no emirate filter
    Then all small-town theaters across the UAE should be included

  Scenario: Mix granular and broad targeting
    When I select the zone "City Center" in "Dubai"
    And I also select the individual theater "Kalba Town Cinema"
    Then the plan should include both selections in the targeting summary
