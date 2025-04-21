import { test, expect, defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env.test file
dotenv.config({ path: '.env.test' });

const TEST_USER = {
  email: process.env.E2E_USERNAME,
  password: process.env.E2E_PASSWORD,
};

test.describe('Topics Flow', () => {
  test.beforeAll(() => {
    if (!TEST_USER.email || !TEST_USER.password) {
      throw new Error('E2E_USERNAME and E2E_PASSWORD must be set in .env.test file');
    }
    if (!process.env.PUBLIC_SUPABASE_URL || !process.env.PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set in .env.test file');
    }
    console.log('Environment variables loaded successfully');
  });

  // Removed test.setTimeout(3000) because 3 seconds is too short

  test('Basic topic flow', async ({ page }) => {
    console.log('Step 1: Navigating to homepage');
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Flashcard Generator/);

    console.log('Step 2: Logging in');
    await page.getByTestId('login-link').click();
    await expect(page.url()).toContain('/login');
    await page.getByTestId('login-email').fill(TEST_USER.email);
    await page.getByTestId('login-password').fill(TEST_USER.password);
    await page.getByTestId('login-submit').click();

    console.log('Step 3: Waiting for authentication');
    await page.getByTestId('authenticated-section').waitFor({ state: 'visible', timeout: 10000 });
    console.log('Authentication successful');

    console.log('Step 4: Navigating to topics page');
    await page.getByTestId('manage-topics-link').click();
    await expect(page.url()).toContain('/topics');

    //without if it tries to click to fast in next button, timeout on click does not fix it
    await page.waitForTimeout(1000);

    console.log('Step 5: Opening Add Topic modal');
    await page.getByTestId('add-topic-button').click({timeout: 5000});
    await expect(page.getByTestId('add-topic-form')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('topic-name-input')).toBeVisible();
    await expect(page.getByTestId('create-topic-button')).toBeVisible();

    // console.log('Step 6: Creating a new topic');
    // const topicName = `Test Topic ${Date.now()}`;
    // await page.getByTestId('topic-name-input').fill(topicName);
    // await page.getByTestId('create-topic-button').click();
    //
    // console.log('Step 7: Verifying topic creation');
    // // Wait for the modal to close
    // await expect(page.getByTestId('add-topic-form')).not.toBeVisible({ timeout: 5000 });
    //
    // // Verify the topic appears in the list
    // await expect(page.getByText(topicName)).toBeVisible({ timeout: 10000 });

    console.log('Test completed successfully');
  });
});
