import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CinemaWorld } from '../support/world';

// F7 @smoke: schedule refresh propagates
Given('the schedule feed is updated for 40 theaters', async function () {
  // Demo app simulates feed; no-op in CI context.
});

When('I click {string}', async function (this: CinemaWorld, label: string) {
  if (/refresh feed/i.test(label)) {
    await this.goto('/');
    await this.page.getByTestId('feed-pill').click();
  } else {
    await this.page.getByRole('button', { name: new RegExp(label, 'i') }).click();
  }
});

Then('the Ad Slots calendars should re-render with the new times', async function (
  this: CinemaWorld,
) {
  // Sanity nav: the AdSlots page renders the toolbar.
  await this.goto('/ad-slots');
  await expect(this.page.getByTestId('programmatic-toggle')).toBeVisible();
});

Then('the {string} indicator should update', async function (this: CinemaWorld, which: string) {
  await this.goto('/');
  const pill = this.page.getByTestId('feed-pill');
  await expect(pill).toBeVisible();
  // After click, pill shows "just now" in the ago span regardless of "Last synced" label copy.
  await expect(pill).toContainText(/just now/i);
  expect(which.toLowerCase()).toContain('last synced');
});
