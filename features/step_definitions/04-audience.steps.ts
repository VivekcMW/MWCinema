import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AUDIENCE_PACKAGES, packageById } from '../../src/data/cinemaMeta';

// F4 @unit: audience package data model guarantees pre-fill rules.
When('I select the audience package {string}', async function (name: string) {
  const pkg = AUDIENCE_PACKAGES.find((p) => p.name.toLowerCase() === name.toLowerCase());
  expect(pkg, `package "${name}" not found`).toBeDefined();
  (this as any).pkg = pkg;
});

Then(
  'the Targeting step should pre-fill genres {string}',
  function (expected: string) {
    const pkg = (this as any).pkg as ReturnType<typeof packageById>;
    const wanted = expected.split(',').map((g) => g.trim().toLowerCase());
    expect(pkg!.genres.map((g) => g.toLowerCase())).toEqual(expect.arrayContaining(wanted));
  },
);

Then('cinema types {string}', function (expected: string) {
  const pkg = (this as any).pkg as ReturnType<typeof packageById>;
  const wanted = expected.split(',').map((g) => g.trim().toLowerCase());
  expect(pkg!.cinemaTypes.map((t) => t.toLowerCase())).toEqual(expect.arrayContaining(wanted));
});

Then('daypart {string}', function (expected: string) {
  const pkg = (this as any).pkg as ReturnType<typeof packageById>;
  expect(pkg!.dayparts.map((d) => d.toLowerCase())).toContain(expected.toLowerCase());
});

Then('show an estimated reach on the summary panel', function () {
  const pkg = (this as any).pkg as ReturnType<typeof packageById>;
  expect(pkg!.estReach).toBeTruthy();
  expect(String(pkg!.estReach).length).toBeGreaterThan(0);
});
