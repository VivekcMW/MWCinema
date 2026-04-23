import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CinemaWorld } from '../support/world';

// F9 @smoke: feed pill visible
When('I look at the top bar', async function (this: CinemaWorld) {
  await this.goto('/');
  await expect(this.page.getByTestId('feed-pill')).toBeVisible();
});

Then(
  'I should see a {string} or {string} pill with a {string} timestamp',
  async function (this: CinemaWorld, healthy: string, stale: string, synced: string) {
    const pill = this.page.getByTestId('feed-pill');
    await expect(pill).toContainText(new RegExp(`${healthy}|${stale}`, 'i'));
    // "last synced" timestamp renders as "just now" or "Nm ago"
    await expect(pill).toContainText(/(just now|\dm ago)/i);
    expect(synced.toLowerCase()).toContain('last synced');
  },
);
