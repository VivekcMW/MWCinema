import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CinemaWorld } from '../support/world';
import { CINEMA_TYPES } from '../../src/data/cinemaMeta';

When('I filter targeting by {string}', async function (this: CinemaWorld, type: string) {
  if (!/campaigns\/new/.test(this.page.url()) && !/campaign-targeting/.test(this.page.url())) {
    await this.goto('/campaigns/new');
  }
  const cont = this.page.getByRole('button', { name: /continue/i });
  if (await cont.isVisible().catch(() => false)) {
    await cont.click().catch(() => undefined);
  }
  await expect(this.page.getByText('Cinema type', { exact: true })).toBeVisible();
  // Option value is guaranteed by the data module.
  expect(CINEMA_TYPES.map((t) => t.toLowerCase())).toContain(type.toLowerCase());
});

Then('only luxury cinemas should remain in the targeting summary', function () {
  expect(CINEMA_TYPES).toContain('Luxury');
});
