import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { theaterMeta } from '../../src/data/cinemaMeta';

// F5 @unit
Given('the inventory catalogue is loaded', function () {
  expect(theaterMeta.length).toBeGreaterThan(0);
});

Then('each theater should expose country, emirate, city and zone', function () {
  for (const t of theaterMeta) {
    expect(t.country, `${t.code} missing country`).toBeTruthy();
    expect(t.emirate, `${t.code} missing emirate`).toBeTruthy();
    expect(t.city, `${t.code} missing city`).toBeTruthy();
    expect(t.zone, `${t.code} missing zone`).toBeTruthy();
  }
});
