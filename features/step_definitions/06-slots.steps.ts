import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { TIER_PRICING } from '../../src/data/cinemaMeta';

// F6 @unit: tiered pricing
Then(
  'the Pre-show 60s slot should be priced higher \\(tier 1) than the 30s slot \\(tier 2)',
  function () {
    expect(TIER_PRICING['pre-show-60'].price).toBeGreaterThan(TIER_PRICING['pre-show-30'].price);
    expect(TIER_PRICING['pre-show-60'].tier).toBe(1);
    expect(TIER_PRICING['pre-show-30'].tier).toBe(2);
  },
);

Then('the interval slot should be the lowest-priced tier \\(tier 3)', function () {
  expect(TIER_PRICING['interval'].tier).toBe(3);
  expect(TIER_PRICING['interval'].price).toBeLessThan(TIER_PRICING['pre-show-30'].price);
});
