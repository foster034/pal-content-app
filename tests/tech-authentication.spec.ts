import { test, expect } from '@playwright/test';
import { TechAuthHelper } from './tech-auth.helper';

test.describe('Tech Authentication', () => {
  let techAuth: TechAuthHelper;

  test.beforeEach(async ({ page }) => {
    techAuth = new TechAuthHelper(page);
  });

  test('should redirect unauthenticated user to tech-auth page', async ({ page }) => {
    // Try to access tech dashboard without authentication
    await page.goto('/tech/dashboard');

    // Should be redirected to tech-auth page
    await expect(page).toHaveURL('/tech-auth');

    // Should see login form
    await expect(page.locator('input[id="loginCode"]')).toBeVisible();
    await expect(page.locator('text=Technician Login')).toBeVisible();
  });

  test('should allow tech login with valid login code', async ({ page }) => {
    // Navigate to tech auth page
    await page.goto('/tech-auth');

    // Fill in valid login code (from sample data)
    await page.fill('input[id="loginCode"]', 'TEMP01');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/tech/dashboard', { timeout: 10000 });

    // Verify we're on the dashboard
    await expect(page).toHaveURL('/tech/dashboard');

    // Verify tech session was created
    const isAuthenticated = await techAuth.isAuthenticated();
    expect(isAuthenticated).toBe(true);
  });

  test('should reject invalid login code', async ({ page }) => {
    // Navigate to tech auth page
    await page.goto('/tech-auth');

    // Fill in invalid login code
    await page.fill('input[id="loginCode"]', 'INVALID');

    // Click login button
    await page.click('button[type="submit"]');

    // Should see error message
    await expect(page.locator('text=Invalid login code')).toBeVisible();

    // Should still be on auth page
    await expect(page).toHaveURL('/tech-auth');
  });

  test('should access tech profile after authentication', async ({ page }) => {
    // Login as tech user
    await techAuth.loginAsTech('TEMP01');

    // Navigate to profile page
    await page.goto('/tech/profile');

    // Should successfully load profile page
    await expect(page).toHaveURL('/tech/profile');

    // Should see profile content
    await expect(page.locator('text=Pop-A-Lock Technician')).toBeVisible();

    // Should see profile stats
    await expect(page.locator('text=Level')).toBeVisible();
    await expect(page.locator('text=Total Jobs')).toBeVisible();
  });

  test('should show Profile & Settings link in sidebar when authenticated', async ({ page }) => {
    // Login as tech user
    await techAuth.loginAsTech('TEMP01');

    // Navigate to dashboard
    await page.goto('/tech/dashboard');

    // Should see Profile & Settings link in sidebar
    await expect(page.locator('a[href="/tech/profile"]')).toBeVisible();
    await expect(page.locator('text=Profile & Settings')).toBeVisible();
  });

  test('should hide Profile & Settings link when not authenticated', async ({ page }) => {
    // Clear any existing auth
    await techAuth.logout();

    // Navigate to tech-auth page (where unauthenticated users would be)
    await page.goto('/tech-auth');

    // Profile & Settings link should not be visible
    await expect(page.locator('a[href="/tech/profile"]')).not.toBeVisible();
  });

  test('should logout and clear session', async ({ page }) => {
    // Login as tech user
    await techAuth.loginAsTech('TEMP01');

    // Navigate to dashboard
    await page.goto('/tech/dashboard');

    // Click logout button
    await page.click('text=Logout');

    // Should be redirected to tech-auth page
    await page.waitForURL('/tech-auth');
    await expect(page).toHaveURL('/tech-auth');

    // Session should be cleared
    const isAuthenticated = await techAuth.isAuthenticated();
    expect(isAuthenticated).toBe(false);
  });

  test('should handle expired sessions', async ({ page }) => {
    // Login as tech user
    await techAuth.loginAsTech('TEMP01');

    // Manually expire the session by setting old login time
    await page.evaluate(() => {
      const sessionData = localStorage.getItem('tech_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Set login time to 25 hours ago (expired)
        session.loginTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('tech_session', JSON.stringify(session));
      }
    });

    // Try to access profile page
    await page.goto('/tech/profile');

    // Should be redirected to tech-auth due to expired session
    await page.waitForURL('/tech-auth');
    await expect(page).toHaveURL('/tech-auth');
  });

  test('should allow navigation between tech pages when authenticated', async ({ page }) => {
    // Login as tech user
    await techAuth.loginAsTech('TEMP01');

    // Navigate to dashboard
    await page.goto('/tech/dashboard');
    await expect(page).toHaveURL('/tech/dashboard');

    // Navigate to photos page
    await page.click('a[href="/tech/photos"]');
    await expect(page).toHaveURL('/tech/photos');

    // Navigate to profile page
    await page.click('a[href="/tech/profile"]');
    await expect(page).toHaveURL('/tech/profile');

    // All navigation should work without redirects
  });
});