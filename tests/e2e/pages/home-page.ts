import { Page } from "@playwright/test";

export class HomePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto("/");
  }

  getTitle() {
    return this.page.locator("h1");
  }

  async clickOnNavLink(text: string) {
    await this.page.getByRole("link", { name: text }).click();
  }
}
