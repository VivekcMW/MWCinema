Feature: Inventory data model
  As a system
  I need structured inventory metadata
  So that planning and execution can filter and price inventory correctly

  @unit
  Scenario: Every theater exposes hierarchical location metadata
    Given the inventory catalogue is loaded
    Then each theater should expose country, emirate, city and zone

  Scenario: Every theater exposes cinema types
    Then each theater should list one or more cinema formats (Standard / Luxury / IMAX / 4DX / Bean Bag)

  Scenario: Every session has 60s and 30s pre-show slots
    When I open any showtime in the Ad Slots page
    Then the slot detail drawer should show pre-show 60s and pre-show 30s capacity

  Scenario: Long films carry interval slot inventory
    Given a film with a runtime of 2h 20m or longer
    Then its sessions should include an interval slot in addition to pre-show slots

  Scenario: Each theater has a programmatic eligibility flag
    When I query theater metadata
    Then each theater should expose a boolean "programmatic" attribute
