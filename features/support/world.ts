import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { BrowserContext, Page } from '@playwright/test';

export class CinemaWorld extends World {
  page!: Page;
  context!: BrowserContext;
  baseURL!: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async goto(path: string) {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }
}

setWorldConstructor(CinemaWorld);
