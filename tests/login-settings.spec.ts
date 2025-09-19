import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TEST_EMAIL = process.env.PLAYWRIGHT_DEMO_EMAIL || 'admin@test.ca';
const TEST_PASSWORD = process.env.PLAYWRIGHT_DEMO_PASSWORD || '123456';

test.describe('Login and Settings', () => {
  test('should login with test credentials and save login settings', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Fill in login credentials from .env
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Click login button
    await page.click('button:has-text("Log in")');

    // Wait for navigation to admin dashboard
    await page.waitForURL('**/admin');

    // Navigate to settings page
    await page.goto('http://localhost:3000/admin/settings');

    // Click on Login Screen tab
    await page.click('button:has-text("Login Screen")');

    // Wait for the login settings to load
    await page.waitForSelector('text=Login Screen Display');

    // Select static image option
    await page.click('label[for="static-image"]');

    // Click save button
    await page.click('button:has-text("Save Login Settings")');

    // Check for success toast
    await expect(page.locator('text=Login settings saved successfully')).toBeVisible({ timeout: 5000 });

    // Now test dynamic option
    await page.click('label[for="dynamic-photos"]');

    // Adjust slider for photo count
    const slider = page.locator('input[type="range"]').first();
    await slider.fill('10');

    // Save again
    await page.click('button:has-text("Save Login Settings")');

    // Check for success toast again
    await expect(page.locator('text=Login settings saved successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should persist settings after page reload', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log in")');
    await page.waitForURL('**/admin');

    // Go to settings and set dynamic photos
    await page.goto('http://localhost:3000/admin/settings');
    await page.click('button:has-text("Login Screen")');
    await page.click('label[for="dynamic-photos"]');
    await page.click('button:has-text("Save Login Settings")');
    await page.waitForSelector('text=Login settings saved successfully');

    // Reload page
    await page.reload();

    // Click Login Screen tab again
    await page.click('button:has-text("Login Screen")');

    // Check if dynamic photos is still selected
    const dynamicRadio = page.locator('input[id="dynamic-photos"]');
    await expect(dynamicRadio).toBeChecked();
  });
});