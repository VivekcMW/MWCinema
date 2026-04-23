import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CinemaWorld } from '../support/world';

// ---------- Shared navigation ----------
Given('I am on the {string} wizard', async function (this: CinemaWorld, name: string) {
  if (/new campaign/i.test(name)) {
    await this.goto('/campaigns/new');
  } else {
    throw new Error(`Unknown wizard: ${name}`);
  }
});

Given('I am on the {string} step', async function (this: CinemaWorld, step: string) {
  if (/targeting/i.test(step)) {
    const cont = this.page.getByRole('button', { name: /continue/i });
    await cont.click();
    await expect(this.page.getByText(/audience package/i).first()).toBeVisible();
  }
});

// ---------- Generic "cinema inventory is tagged..." guards (data-truth) ----------
Given('cinema inventory is tagged with emirate, city and zone', async function () {
  // data-level guarantee covered by F5 @unit scenario; no-op here.
});

Given('cinema inventory includes urban and small-town classifications', async function () {
  // data-level guarantee; see F5 @unit.
});

Given('cinemas are categorised by type', async function () {
  // data-level guarantee; see F5 @unit.
});

Given('movies are mapped to screens and showtimes', async function () {
  // data-level guarantee.
});
