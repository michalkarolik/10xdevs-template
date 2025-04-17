import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';

test('Home page should have the correct title', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();
  await expect(homePage.getTitle()).toContainText('10xDevs');
});

test('Home page should navigate to another page', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();
  await homePage.clickOnNavLink('About');
  
  await expect(page).toHaveURL(/.*about/);
  await expect(page).toHaveScreenshot('about-page.png');
});
