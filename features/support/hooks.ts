import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { CinemaWorld } from './world';

setDefaultTimeout(30_000);

let browser: Browser;

BeforeAll(async function () {
  browser = await chromium.launch({
    headless: process.env.HEADED !== '1',
  });
});

AfterAll(async function () {
  await browser?.close();
});

Before(async function (this: CinemaWorld) {
  this.context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  this.page = await this.context.newPage();
  this.baseURL = process.env.BASE_URL ?? 'http://localhost:5173';
});

After(async function (this: CinemaWorld, { result }) {
  if (result?.status === 'FAILED' && this.page) {
    const buf = await this.page.screenshot({ fullPage: true });
    this.attach(buf, 'image/png');
  }
  await this.page?.close();
  await this.context?.close();
});
