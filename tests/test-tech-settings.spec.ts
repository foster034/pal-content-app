import { test, expect } from '@playwright/test';

test.describe('Tech Settings Page', () => {
  test('should navigate to tech settings without redirect', async ({ page }) => {
    // Start at tech dashboard
    await page.goto('http://localhost:3000/tech/dashboard');

    // Check if we're on the dashboard
    console.log('Current URL after navigation:', page.url());

    // Look for the settings link in the sidebar
    const settingsLink = page.locator('a[href="/tech/settings"]').first();

    // Check if settings link exists
    const linkExists = await settingsLink.count() > 0;
    console.log('Settings link exists:', linkExists);

    if (linkExists) {
      // Click on settings
      await settingsLink.click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');

      // Check where we ended up
      const currentUrl = page.url();
      console.log('URL after clicking settings:', currentUrl);

      // Take a screenshot
      await page.screenshot({ path: 'tech-settings-result.png' });

      // Check if we were redirected to login
      if (currentUrl.includes('login')) {
        console.log('ERROR: Redirected to login page!');

        // Check for any error messages
        const errorMessages = await page.locator('.error, .alert, [role="alert"]').allTextContents();
        console.log('Error messages on page:', errorMessages);
      }

      // We should be on the settings page
      expect(currentUrl).toContain('/tech/settings');
    } else {
      // Try to navigate directly
      console.log('Settings link not found, navigating directly...');
      await page.goto('http://localhost:3000/tech/settings');

      const finalUrl = page.url();
      console.log('Final URL after direct navigation:', finalUrl);

      await page.screenshot({ path: 'tech-settings-direct.png' });

      expect(finalUrl).toContain('/tech/settings');
    }
  });

  test('check tech settings page existence and route', async ({ page }) => {
    // Try direct navigation to settings
    const response = await page.goto('http://localhost:3000/tech/settings', {
      waitUntil: 'domcontentloaded'
    });

    console.log('Response status:', response?.status());
    console.log('Response URL:', response?.url());

    // Check if the page exists
    if (response?.status() === 404) {
      console.log('ERROR: Tech settings page returns 404!');
    }

    // Check the final URL
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);

    // Check page content
    const pageContent = await page.content();

    // Look for login-related content
    if (pageContent.includes('Sign in') || pageContent.includes('Login')) {
      console.log('Page contains login form - authentication issue detected');
    }

    // Look for settings-related content
    if (pageContent.includes('Settings') || pageContent.includes('Profile')) {
      console.log('Page contains settings content');
    }

    await page.screenshot({ path: 'tech-settings-page.png' });
  });
});