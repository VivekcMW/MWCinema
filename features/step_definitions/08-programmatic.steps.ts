import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CinemaWorld } from '../support/world';
import { theaterMeta, getTheaterName } from '../../src/data/cinemaMeta';

// F8 @smoke: DSP shows only programmatic-eligible inventory
When('I open the DSP page', async function (this: CinemaWorld) {
  await this.goto('/dsp');
  await expect(this.page.getByTestId('programmatic-inventory')).toBeVisible();
});

Then('only theaters with programmatic = true should be listed', async function (
  this: CinemaWorld,
) {
  const grid = this.page.getByTestId('programmatic-inventory');
  for (const t of theaterMeta.filter((x) => x.programmatic)) {
    await expect(grid).toContainText(getTheaterName(t.code));
  }
  // Non-programmatic must NOT appear inside the programmatic grid.
  const gridHtml = await grid.innerHTML();
  for (const t of theaterMeta.filter((x) => !x.programmatic)) {
    expect(gridHtml).not.toContain(getTheaterName(t.code));
  }
});
