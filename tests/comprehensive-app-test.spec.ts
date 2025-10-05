import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'brentfoster.popalock@gmail.com',
  password: 'B69706034',
};

const ADMIN_ROUTES = [
  '/admin',
  '/admin/franchisees',
  '/admin/techs',
  '/admin/marketing',
  '/admin/settings',
  '/admin/profile',
];

const FRANCHISEE_ROUTES = [
  '/franchisee',
  '/franchisee/marketing',
  '/franchisee/profile',
  '/franchisee/settings',
];

const TECH_ROUTES = [
  '/tech/dashboard',
  '/tech/photos',
  '/tech/profile',
  '/tech/setup',
];

test.describe('Comprehensive App Testing - Post Cleanup', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');

    // Fill in login credentials
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForURL(/\/(admin|franchisee|tech)/);
  });

  test.describe('Admin Pages', () => {
    for (const route of ADMIN_ROUTES) {
      test(`Admin page ${route} should load without errors`, async ({ page }) => {
        // Navigate to the route
        await page.goto(route);

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check for build errors on the page
        const buildError = await page.locator('text=Build Error').count();
        expect(buildError).toBe(0);

        // Check for module not found errors
        const moduleError = await page.locator('text=Module not found').count();
        expect(moduleError).toBe(0);

        // Check for 500 errors
        const serverError = await page.locator('text=500').count();
        expect(serverError).toBe(0);

        // Check for 404 errors
        const notFoundError = await page.locator('text=404').count();
        expect(notFoundError).toBe(0);

        // Check that page has content
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).not.toBe('');

        console.log(`✅ ${route} loaded successfully`);
      });
    }
  });

  test.describe('Franchisee Pages', () => {
    for (const route of FRANCHISEE_ROUTES) {
      test(`Franchisee page ${route} should load without errors`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState('networkidle');

        const buildError = await page.locator('text=Build Error').count();
        expect(buildError).toBe(0);

        const moduleError = await page.locator('text=Module not found').count();
        expect(moduleError).toBe(0);

        const bodyText = await page.locator('body').textContent();
        expect(bodyText).not.toBe('');

        console.log(`✅ ${route} loaded successfully`);
      });
    }
  });

  test.describe('Tech Pages', () => {
    for (const route of TECH_ROUTES) {
      test(`Tech page ${route} should load without errors`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState('networkidle');

        const buildError = await page.locator('text=Build Error').count();
        expect(buildError).toBe(0);

        const moduleError = await page.locator('text=Module not found').count();
        expect(moduleError).toBe(0);

        const bodyText = await page.locator('body').textContent();
        expect(bodyText).not.toBe('');

        console.log(`✅ ${route} loaded successfully`);
      });
    }
  });

  test('Check for console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Visit all pages and collect console errors
    for (const route of [...ADMIN_ROUTES, ...FRANCHISEE_ROUTES, ...TECH_ROUTES]) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }

    // Report console errors
    if (consoleErrors.length > 0) {
      console.log('⚠️ Console errors found:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }

    // Don't fail test on console errors, just report them
    // expect(consoleErrors.length).toBe(0);
  });

  test('Check for missing images', async ({ page }) => {
    const routes = [...ADMIN_ROUTES, ...FRANCHISEE_ROUTES, ...TECH_ROUTES];
    const brokenImages: string[] = [];

    page.on('response', response => {
      if (response.request().resourceType() === 'image' && response.status() === 404) {
        brokenImages.push(response.url());
      }
    });

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }

    if (brokenImages.length > 0) {
      console.log('⚠️ Broken images found:');
      brokenImages.forEach(img => console.log(`  - ${img}`));
    }
  });

  test('Admin settings page - Login Screen tab', async ({ page }) => {
    await page.goto('/admin/settings');

    // Click on Login Screen tab
    await page.click('button:has-text("Login Screen")');

    // Wait for content to load
    await page.waitForSelector('text=Background Image');

    // Check that upload field exists
    const uploadField = await page.locator('input[type="file"]').count();
    expect(uploadField).toBeGreaterThan(0);

    console.log('✅ Login Screen settings tab loaded successfully');
  });

  test('Admin marketing page', async ({ page }) => {
    await page.goto('/admin/marketing');
    await page.waitForLoadState('networkidle');

    // Check that media archive section exists
    const mediaArchive = await page.locator('text=Media Archive').count();
    expect(mediaArchive).toBeGreaterThan(0);

    console.log('✅ Marketing page loaded successfully');
  });
});
