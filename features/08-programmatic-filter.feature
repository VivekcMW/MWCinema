Feature: Programmatic inventory filtering
  As a programmatic buyer
  I want to see only programmatically eligible slots
  So that I can transact without risk of manual-only inventory

  @smoke
  Scenario: Only programmatic slots appear in the DSP view
    When I open the DSP page
    Then only theaters with programmatic = true should be listed

  Scenario: Programmatic filter in the Ad Slots page
    When I enable "Programmatic only" in the Ad Slots toolbar
    Then the calendar should hide sessions whose theater is non-programmatic

  Scenario: Programmatic badge on every eligible session tile
    When I hover over a session
    Then the tooltip should indicate whether it is programmatically available

  Scenario: Direct-sale inventory is never exposed to the DSP
    Given theater "City Centre Deira" is flagged non-programmatic
    When I view the DSP inventory list
    Then "City Centre Deira" should not appear
