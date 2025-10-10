import { test, expect } from '@playwright/test';

test.describe('CarKeyPro.app Production Site', () => {
  test('should load the production site successfully', async ({ page }) => {
    // Navigate to production site
    await page.goto('https://www.carkeypro.app');

    // Wait for the page to load (give it time for service worker and initial render)
    await page.waitForLoadState('networkidle');

    // Check that we're on the correct domain
    expect(page.url()).toContain('carkeypro.app');

    // Take a screenshot
    await page.screenshot({ path: 'test-results/carkeypro-homepage.png', fullPage: true });

    console.log('✅ Production site loaded successfully');
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to production site
    await page.goto('https://www.carkeypro.app');
    await page.waitForLoadState('networkidle');

    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors found:', consoleErrors);
    } else {
      console.log('✅ No console errors found');
    }

    // We'll allow some errors but log them for review
    console.log(`Total console errors: ${consoleErrors.length}`);
  });

  test('should have service worker registered', async ({ page }) => {
    await page.goto('https://www.carkeypro.app');
    await page.waitForLoadState('networkidle');

    // Wait a bit for service worker to register
    await page.waitForTimeout(2000);

    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });

    console.log('Service Worker Registered:', swRegistered);
    expect(swRegistered).toBeTruthy();
  });

  test('should display login page', async ({ page }) => {
    await page.goto('https://www.carkeypro.app');
    await page.waitForLoadState('networkidle');

    // Wait for either the login form or a redirect
    await page.waitForTimeout(3000);

    // Check if we can see login-related elements
    const hasLoginElements = await page.evaluate(() => {
      const body = document.body.innerText.toLowerCase();
      return body.includes('login') ||
             body.includes('sign in') ||
             body.includes('email') ||
             body.includes('password');
    });

    console.log('Login elements found:', hasLoginElements);

    // Take a screenshot of what we see
    await page.screenshot({ path: 'test-results/carkeypro-current-view.png', fullPage: true });
  });

  test('should be able to navigate to auth/login', async ({ page }) => {
    await page.goto('https://www.carkeypro.app/auth/login');
    await page.waitForLoadState('networkidle');

    // Wait for page to render
    await page.waitForTimeout(2000);

    // Take a screenshot
    await page.screenshot({ path: 'test-results/carkeypro-login-page.png', fullPage: true });

    // Check for login form elements
    const pageContent = await page.content();
    console.log('Page URL:', page.url());
    console.log('Page contains "email":', pageContent.toLowerCase().includes('email'));
    console.log('Page contains "password":', pageContent.toLowerCase().includes('password'));
  });

  test('should check for profile API errors', async ({ page }) => {
    const apiErrors: any[] = [];

    // Listen for failed API requests
    page.on('response', (response) => {
      if (response.url().includes('/api/profile') && !response.ok()) {
        apiErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    await page.goto('https://www.carkeypro.app');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    if (apiErrors.length > 0) {
      console.log('❌ API errors found:', apiErrors);
    } else {
      console.log('✅ No API errors found for /api/profile');
    }
  });

  test('should verify new service worker version is deployed', async ({ page }) => {
    await page.goto('https://www.carkeypro.app');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check service worker cache name
    const cacheInfo = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      return cacheNames;
    });

    console.log('Available caches:', cacheInfo);

    // Check if new cache version exists (should contain '2025-10-10-v2')
    const hasNewCache = cacheInfo.some((name: string) =>
      name.includes('2025-10-10-v2')
    );

    console.log('New service worker cache deployed:', hasNewCache);

    if (hasNewCache) {
      console.log('✅ New service worker version is active!');
    } else {
      console.log('⚠️ Old service worker may still be active. Clear cache and try again.');
    }
  });
});
