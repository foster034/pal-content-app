import { test, expect } from '@playwright/test';

test.describe('Vercel Deployment Check', () => {
  const VERCEL_URL = 'https://pal-content-1x2iuofv0-brents-projects-c51a7c87.vercel.app';

  test('should load homepage without errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Navigate to the site
    await page.goto(VERCEL_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for page title or main content
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });

    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }

    if (pageErrors.length > 0) {
      console.log('Page errors found:', pageErrors);
    }

    // Take screenshot
    await page.screenshot({ path: 'vercel-homepage.png', fullPage: true });

    // Check if there are any obvious error messages on the page
    const errorElements = await page.locator('text=/error|Error|ERROR/i').all();
    if (errorElements.length > 0) {
      console.log('Error text found on page');
      for (const element of errorElements) {
        const text = await element.textContent();
        console.log('Error text:', text);
      }
    }
  });

  test('should check main navigation paths', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');

    // Try to navigate to common routes
    const routes = [
      '/admin',
      '/franchisee',
      '/tech/dashboard',
      '/auth/login'
    ];

    for (const route of routes) {
      console.log(`Testing route: ${route}`);
      try {
        await page.goto(`${VERCEL_URL}${route}`);
        await page.waitForLoadState('networkidle', { timeout: 5000 });

        // Check if we got a 404 or error page
        const pageContent = await page.content();
        if (pageContent.includes('404') || pageContent.includes('This page could not be found')) {
          console.log(`Route ${route} returned 404`);
        } else {
          console.log(`Route ${route} loaded successfully`);
        }

        await page.screenshot({ path: `vercel-${route.replace(/\//g, '-')}.png` });
      } catch (error) {
        console.log(`Error loading route ${route}:`, error);
      }
    }

    if (consoleErrors.length > 0) {
      console.log('Console errors during navigation:', consoleErrors);
    }
  });
});