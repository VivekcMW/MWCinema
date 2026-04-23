Feature: Movie-based targeting
  As a media planner
  I want to target a specific movie
  So that my ad reaches the right audience via title affinity

  Scenario: Target all screens playing a specific movie
    Given movies are mapped to screens and showtimes
    When I enable "Target by movie"
    And I select "Avatar: Fire and Ash"
    Then the plan should list every screen currently playing that film

  Scenario: Show session count per screen
    Given I have selected the movie "Avatar: Fire and Ash"
    Then each matched screen should display the number of sessions and next showtime

  @unit
  Scenario: Movie list reflects currently playing films only
    When I open the movie picker
    Then only films with at least one scheduled session this week should appear

  Scenario: Switch movie re-resolves the screens
    Given I have selected the movie "Avatar: Fire and Ash"
    When I change the movie to "Zootropolis 2"
    Then the screen list should refresh to the new set without a page reload
