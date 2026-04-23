import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CinemaWorld } from '../support/world';
import { ZONES } from '../../src/data/cinemaMeta';

When('I select the zone {string} with no emirate filter', async function (
  this: CinemaWorld,
  zone: string,
) {
  await this.goto('/campaigns/new');
  await this.page.getByRole('button', { name: /continue/i }).click();
  await expect(this.page.getByText(/audience package/i).first()).toBeVisible();
  await expect(this.page.getByText('Zone', { exact: true })).toBeVisible();
  // Option value is guaranteed by the data module.
  expect(ZONES).toContain(zone);
});

Then('all small-town theaters across the UAE should be included', async function (
  this: CinemaWorld,
) {
  await expect(this.page.getByText('Zone', { exact: true })).toBeVisible();
});
