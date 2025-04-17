import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly title: Locator;
  readonly navLinks: Record<string, Locator>;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.navLinks = {
      'About': page.getByRole('link', { name: 'About' }),
      // Add more navigation links as needed
    };
  }

  async navigate() {
    await this.page.goto('/');
  }

  getTitle() {
    return this.title;
  }

  async clickOnNavLink(name: string) {
    await this.navLinks[name].click();
  }
}
