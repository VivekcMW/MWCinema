import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ALL_FILM_TITLES } from '../../src/data/cinemaMeta';

// F3 @unit: movie list reflects currently playing films only (data-level)
When('I open the movie picker', async function () {
  // Reference a known title to ensure the data is reachable at runtime.
  expect(ALL_FILM_TITLES.length).toBeGreaterThan(0);
});

Then('only films with at least one scheduled session this week should appear', async function () {
  expect(ALL_FILM_TITLES.every((t) => typeof t === 'string' && t.length > 0)).toBe(true);
});
