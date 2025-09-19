import { test, expect } from '@playwright/test';

test.describe('Tech Profile Access After Fix', () => {
  test('should access tech profile without redirect to login', async ({ page }) => {
    console.log('Starting test - navigating to tech dashboard...');

    // First navigate to tech dashboard
    await page.goto('http://localhost:3000/tech/dashboard');
    await page.waitForLoadState('networkidle');

    const dashboardUrl = page.url();
    console.log('Current URL after dashboard navigation:', dashboardUrl);

    // Take screenshot of dashboard
    await page.screenshot({ path: 'tech-dashboard-state.png' });

    // Look for Profile & Settings link in sidebar
    const profileLink = page.locator('a[href="/tech/profile"]').first();
    const linkCount = await profileLink.count();
    console.log('Profile link found:', linkCount > 0);

    if (linkCount > 0) {
      // Get link text to confirm it's the right one
      const linkText = await profileLink.textContent();
      console.log('Link text:', linkText);

      // Click on Profile & Settings
      console.log('Clicking on Profile & Settings link...');
      await profileLink.click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');

      const profileUrl = page.url();
      console.log('URL after clicking profile:', profileUrl);

      // Take screenshot
      await page.screenshot({ path: 'tech-profile-result.png' });

      // Check we're on the profile page
      if (profileUrl.includes('/auth/login')) {
        console.log('❌ ERROR: Still redirecting to login page!');

        // Check for error messages
        const errorMessages = await page.locator('.error, .alert, [role="alert"]').allTextContents();
        console.log('Error messages:', errorMessages);
      } else if (profileUrl.includes('/tech/profile')) {
        console.log('✅ SUCCESS: On tech profile page!');

        // Check for profile content
        const pageContent = await page.content();
        if (pageContent.includes('Profile') || pageContent.includes('Settings')) {
          console.log('✅ Profile content is visible');
        }
      } else {
        console.log('⚠️ Unexpected URL:', profileUrl);
      }

      // Assertion - should be on profile page
      expect(profileUrl).toContain('/tech/profile');
      expect(profileUrl).not.toContain('/auth/login');

    } else {
      console.log('Profile link not found in sidebar, checking direct navigation...');

      // Try direct navigation
      await page.goto('http://localhost:3000/tech/profile');
      await page.waitForLoadState('networkidle');

      const directUrl = page.url();
      console.log('URL after direct navigation:', directUrl);

      await page.screenshot({ path: 'tech-profile-direct.png' });

      // Should be on profile page
      expect(directUrl).toContain('/tech/profile');
      expect(directUrl).not.toContain('/auth/login');
    }
  });

  test('verify tech profile page content loads correctly', async ({ page }) => {
    console.log('Testing profile page content...');

    // Navigate directly to profile
    await page.goto('http://localhost:3000/tech/profile');
    await page.waitForLoadState('domcontentloaded');

    const url = page.url();
    console.log('Profile page URL:', url);

    if (!url.includes('/auth/login')) {
      // Look for profile page elements
      const hasProfileTitle = await page.locator('text=/Profile/i').count() > 0;
      const hasSettingsContent = await page.locator('text=/Settings/i').count() > 0;
      const hasEmailField = await page.locator('text=/Email/i').count() > 0;

      console.log('Has Profile title:', hasProfileTitle);
      console.log('Has Settings content:', hasSettingsContent);
      console.log('Has Email field:', hasEmailField);

      // Take full page screenshot
      await page.screenshot({ path: 'tech-profile-content.png', fullPage: true });

      // At least one of these should be present
      expect(hasProfileTitle || hasSettingsContent || hasEmailField).toBeTruthy();
    } else {
      throw new Error('Still redirecting to login after fixes');
    }
  });
});