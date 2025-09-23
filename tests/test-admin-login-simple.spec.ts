import { test, expect } from '@playwright/test';

test('Admin login and check redirect', async ({ page }) => {
  // Start at the login page
  await page.goto('http://localhost:3000/auth/login');

  // Wait for the page to be ready
  await page.waitForSelector('input[type="email"]');

  // Fill in login credentials
  await page.fill('input[type="email"]', 'admin@test.ca');
  await page.fill('input[type="password"]', 'test123456');

  // Take screenshot before login
  await page.screenshot({ path: 'before-login.png', fullPage: true });

  // Click the login button
  await page.click('button:has-text("Log in")');

  // Wait a bit for redirect
  await page.waitForTimeout(3000);

  // Check where we ended up
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);

  // Take a screenshot
  await page.screenshot({ path: 'after-login.png', fullPage: true });

  // Log the page title and content for debugging
  const title = await page.title();
  console.log('Page title:', title);

  // Check for tech auth page elements
  const hasTechLogin = await page.locator('text="Technician Login"').count();
  console.log('Has Technician Login text:', hasTechLogin > 0);

  // Check for admin elements
  const hasAdminDashboard = await page.locator('text="Admin Dashboard"').count();
  console.log('Has Admin Dashboard text:', hasAdminDashboard > 0);
});