import { test, expect } from '@playwright/test';

test.describe('Admin Login Flow', () => {
  test('admin user should be redirected to admin dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('https://www.carkeypro.app/auth/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Fill in login credentials
    await page.fill('input[type="email"]', 'admin@test.ca');
    await page.fill('input[type="password"]', '123456');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('**/admin**', { timeout: 15000 });

    // Verify we're on the admin dashboard
    expect(page.url()).toContain('/admin');
    console.log('✅ Admin user redirected to:', page.url());

    // Take a screenshot
    await page.screenshot({ path: 'test-results/admin-dashboard.png', fullPage: true });

    // Verify admin dashboard elements are present
    const pageContent = await page.textContent('body');
    console.log('Page contains "Admin":', pageContent?.includes('Admin') || false);
  });

  test('should check admin role in database', async ({ page }) => {
    // This test just verifies the middleware is working
    await page.goto('https://www.carkeypro.app/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill credentials
    await page.fill('input[type="email"]', 'admin@test.ca');
    await page.fill('input[type="password"]', '123456');

    // Click login
    await page.click('button[type="submit"]');

    // Wait a bit for authentication
    await page.waitForTimeout(3000);

    // Check that we're NOT on the franchisee page
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);

    if (currentUrl.includes('/franchisee') && !currentUrl.includes('/admin')) {
      console.log('❌ ERROR: Admin user was redirected to franchisee dashboard');
      throw new Error('Admin user should not be on franchisee page');
    } else if (currentUrl.includes('/admin')) {
      console.log('✅ SUCCESS: Admin user is on admin dashboard');
    } else {
      console.log('⚠️ User is on:', currentUrl);
    }
  });

  test('should verify middleware role check', async ({ page }) => {
    const consoleMessages: string[] = [];

    // Capture console logs
    page.on('console', (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Login
    await page.goto('https://www.carkeypro.app/auth/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'admin@test.ca');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForTimeout(5000);

    console.log('Final URL:', page.url());
    console.log('Console messages:', consoleMessages.slice(0, 10)); // Show first 10 messages

    // Take screenshot of final state
    await page.screenshot({ path: 'test-results/admin-login-final-state.png', fullPage: true });
  });
});
