import { test, expect } from '@playwright/test';

test('Admin login should redirect to admin dashboard', async ({ page }) => {
  // Start at the login page
  await page.goto('http://localhost:3000/auth/login');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Fill in login credentials
  await page.fill('input[type="email"]', 'admin@test.ca');
  await page.fill('input[type="password"]', 'test123456');

  // Click the login button
  await page.click('button:has-text("Log in")');

  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle' });

  // Check where we ended up
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);

  // Take a screenshot
  await page.screenshot({ path: 'admin-login-redirect-test.png', fullPage: true });

  // We should be on the admin page, not tech-auth
  expect(currentUrl).toContain('/admin');
  expect(currentUrl).not.toContain('/tech-auth');
});