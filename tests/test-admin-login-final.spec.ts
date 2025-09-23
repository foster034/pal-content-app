import { test, expect } from '@playwright/test';

test('Admin login redirects to admin dashboard not tech-auth', async ({ page }) => {
  // Start at the login page
  await page.goto('http://localhost:3000/auth/login');

  // Wait for the page to be ready
  await page.waitForSelector('input[type="email"]');

  // Fill in login credentials from .env
  await page.fill('input[type="email"]', 'admin@test.ca');
  await page.fill('input[type="password"]', '123456');

  console.log('Logging in with admin@test.ca / 123456');

  // Take screenshot before login
  await page.screenshot({ path: 'before-admin-login.png', fullPage: true });

  // Click the login button
  await page.click('button:has-text("Log in")');

  // Wait for navigation or timeout
  await page.waitForTimeout(5000);

  // Check where we ended up
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);

  // Take a screenshot
  await page.screenshot({ path: 'after-admin-login.png', fullPage: true });

  // Check what page we're on
  if (currentUrl.includes('/admin')) {
    console.log('✅ SUCCESS: Correctly redirected to admin dashboard');
  } else if (currentUrl.includes('/tech-auth')) {
    console.log('❌ ERROR: Incorrectly redirected to tech-auth page');

    // Check page content
    const hasTechLogin = await page.locator('text="Technician Login"').count();
    console.log('Shows Technician Login:', hasTechLogin > 0);
  } else if (currentUrl.includes('/auth/login')) {
    console.log('❌ Still on login page');

    // Check for error
    const errorText = await page.locator('[role="alert"]').textContent().catch(() => null);
    if (errorText) {
      console.log('Error message:', errorText);
    }
  } else {
    console.log('Redirected to:', currentUrl);
  }

  // Assert we're on the admin page
  expect(currentUrl).toContain('/admin');
  expect(currentUrl).not.toContain('/tech-auth');
});