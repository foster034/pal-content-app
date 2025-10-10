import { test, expect } from '@playwright/test';

test.describe('Login Screen Background Image', () => {
  test('should display the new login background image', async ({ page }) => {
    // Set viewport to desktop size to see the full background
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait for login settings to load
    await page.waitForTimeout(2000);

    // Check if the background image is present (desktop view)
    // There are two images - one for mobile (opacity-10) and one for desktop (full opacity)
    const backgroundImages = page.locator('img[alt="Pop-A-Lock Services"]');

    // Should have at least one image
    const count = await backgroundImages.count();
    expect(count).toBeGreaterThan(0);

    // Get all image sources and verify they're using login-background.png
    for (let i = 0; i < count; i++) {
      const imageSrc = await backgroundImages.nth(i).getAttribute('src');
      expect(imageSrc).toContain('login-background.png');
      console.log(`Image ${i + 1} source:`, imageSrc);
    }

    // Check the desktop version specifically (in the left panel, not the mobile overlay)
    const desktopImage = page.locator('.lg\\:flex.lg\\:w-1\\/2 img[alt="Pop-A-Lock Services"]').first();

    // Verify the image loaded successfully (not broken)
    const imageNaturalWidth = await desktopImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(imageNaturalWidth).toBeGreaterThan(0);

    console.log('Desktop image loaded successfully with width:', imageNaturalWidth);

    // Take a screenshot to verify visually
    await page.screenshot({ path: 'test-results/login-screen-with-background.png', fullPage: true });
    console.log('Screenshot saved to test-results/login-screen-with-background.png');
  });

  test('should show login form elements', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for main heading
    await expect(page.getByText('Welcome back to Pop-A-Lock')).toBeVisible();

    // Check for email and password fields
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Check for login button
    await expect(page.getByRole('button', { name: /Log in/i })).toBeVisible();

    // Check for Email Login and Tech Code tabs
    await expect(page.getByText('Email Login')).toBeVisible();
    await expect(page.getByText('Tech Code')).toBeVisible();
  });
});
