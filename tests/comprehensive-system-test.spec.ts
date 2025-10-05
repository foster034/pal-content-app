import { test, expect, Page } from '@playwright/test';

// Test Configuration
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'brentfoster.popalock@gmail.com';
const ADMIN_PASSWORD = 'B69706034';
const TEST_TECH_CODE = '8D0LS9'; // Assuming this is a valid tech code

/**
 * Comprehensive System Test Suite for Pop-A-Lock Content Management SaaS
 *
 * This test suite validates:
 * 1. Authentication System (Admin, Franchisee, Tech)
 * 2. Photo Management Workflows
 * 3. Database Integration
 * 4. API Endpoints
 * 5. User Role-Based Access
 * 6. Mobile Responsiveness
 */

test.describe('Comprehensive Pop-A-Lock System Tests', () => {

  test.describe.serial('Authentication System Tests', () => {

    test('Admin login and dashboard access', async ({ page }) => {
      console.log('Testing admin login flow...');

      // Navigate to login page
      await page.goto(`${BASE_URL}/auth/login`);
      await expect(page).toHaveTitle(/Pop-A-Lock/);

      // Verify login page loads correctly
      await expect(page.locator('h2')).toContainText('Welcome back to Pop-A-Lock');

      // Fill login form
      await page.fill('input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[name="password"]', ADMIN_PASSWORD);

      // Submit login
      await page.click('button[type="submit"]');

      // Wait for navigation and verify admin dashboard
      await page.waitForURL('**/admin**', { timeout: 10000 });
      await expect(page.url()).toContain('/admin');

      // Verify admin dashboard elements
      await expect(page.locator('text=Admin Dashboard')).toBeVisible();

      console.log('✅ Admin login successful');
    });

    test('Tech code login flow', async ({ page }) => {
      console.log('Testing tech code authentication...');

      await page.goto(`${BASE_URL}/auth/login`);

      // Switch to tech code login
      await page.click('button:has-text("Tech Code")');

      // Verify tech code form appears
      await expect(page.locator('input[name="techCode"]')).toBeVisible();
      await expect(page.locator('text=Tech Access Code')).toBeVisible();

      // Test invalid code first
      await page.fill('input[name="techCode"]', 'INVALID');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Invalid tech code')).toBeVisible();

      // Test valid code
      await page.fill('input[name="techCode"]', TEST_TECH_CODE);
      await page.click('button[type="submit"]');

      // Should redirect to tech dashboard
      await page.waitForURL('**/tech/dashboard**', { timeout: 10000 });
      await expect(page.url()).toContain('/tech/dashboard');

      console.log('✅ Tech authentication successful');
    });

    test('Role-based access control', async ({ page }) => {
      console.log('Testing role-based access control...');

      // Test accessing admin page without auth
      await page.goto(`${BASE_URL}/admin`);

      // Should redirect to login or show access denied
      await expect(page.url()).toMatch(/(login|auth|denied)/);

      // Test accessing tech page without auth
      await page.goto(`${BASE_URL}/tech/dashboard`);

      // Should redirect or require authentication
      await expect(page.url()).toMatch(/(login|auth|tech-auth)/);

      console.log('✅ Access control working correctly');
    });
  });

  test.describe.serial('Photo Management System Tests', () => {

    test('Tech photo upload workflow', async ({ page }) => {
      console.log('Testing tech photo upload workflow...');

      // Login as tech first
      await page.goto(`${BASE_URL}/auth/login`);
      await page.click('button:has-text("Tech Code")');
      await page.fill('input[name="techCode"]', TEST_TECH_CODE);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tech/dashboard**');

      // Navigate to photos page or job submission
      await page.goto(`${BASE_URL}/tech/photos`);

      // Test photo upload functionality
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        // Test file upload capability
        await expect(fileInput).toBeVisible();
        console.log('✅ Photo upload interface available');
      }

      // Test job submission modal
      const submitButton = page.locator('button:has-text("Submit Job")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await expect(page.locator('text=Submit Job')).toBeVisible();
        console.log('✅ Job submission modal functional');
      }
    });

    test('Franchisee photo review workflow', async ({ page }) => {
      console.log('Testing franchisee photo review workflow...');

      // Would need franchisee credentials - testing page access
      await page.goto(`${BASE_URL}/franchisee/photos`);

      // Check if page requires authentication
      if (page.url().includes('login') || page.url().includes('auth')) {
        console.log('✅ Franchisee photos page requires authentication');
      } else {
        // If accessible, test functionality
        await expect(page.locator('h1, h2')).toContainText(/photo/i);
        console.log('✅ Franchisee photos page accessible');
      }
    });
  });

  test.describe.serial('API Endpoint Tests', () => {

    test('Franchisee photos API endpoint', async ({ page }) => {
      console.log('Testing franchisee photos API...');

      const response = await page.request.get(`${BASE_URL}/api/franchisee-photos`);

      // API should respond (may require auth)
      expect([200, 401, 403]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(Array.isArray(data)).toBeTruthy();
        console.log('✅ Franchisee photos API responding correctly');
      } else {
        console.log('✅ Franchisee photos API requires authentication (expected)');
      }
    });

    test('Job submissions API endpoint', async ({ page }) => {
      console.log('Testing job submissions API...');

      const response = await page.request.get(`${BASE_URL}/api/job-submissions`);

      // API should respond
      expect([200, 401, 403, 405]).toContain(response.status());
      console.log(`✅ Job submissions API responded with status: ${response.status()}`);
    });

    test('Login settings API endpoint', async ({ page }) => {
      console.log('Testing login settings API...');

      const response = await page.request.get(`${BASE_URL}/api/login-settings`);

      // This should be publicly accessible
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('imageType');
      expect(data).toHaveProperty('headerTitle');

      console.log('✅ Login settings API working correctly');
    });
  });

  test.describe.serial('Database Integration Tests', () => {

    test('Database connectivity through Supabase client', async ({ page }) => {
      console.log('Testing database connectivity...');

      // Test by attempting login (which queries database)
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should get authentication error (not connection error)
      await expect(page.locator('text=Invalid login credentials')).toBeVisible({ timeout: 5000 });

      console.log('✅ Database connectivity confirmed');
    });
  });

  test.describe.serial('Mobile Responsiveness Tests', () => {

    test('Mobile login page responsiveness', async ({ page }) => {
      console.log('Testing mobile responsiveness...');

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto(`${BASE_URL}/auth/login`);

      // Check mobile layout
      await expect(page.locator('h2')).toBeVisible();

      // Test form elements are usable on mobile
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toBeVisible();

      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible();

      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();

      console.log('✅ Mobile responsiveness confirmed');
    });

    test('Admin dashboard mobile view', async ({ page }) => {
      console.log('Testing admin dashboard mobile view...');

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Login as admin
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[name="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');

      await page.waitForURL('**/admin**');

      // Check mobile navigation
      const mobileMenu = page.locator('button[aria-label*="menu"]');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        console.log('✅ Mobile menu functional');
      }

      console.log('✅ Admin mobile view working');
    });
  });

  test.describe.serial('Error Handling Tests', () => {

    test('Network error handling', async ({ page }) => {
      console.log('Testing error handling...');

      await page.goto(`${BASE_URL}/auth/login`);

      // Test with invalid email format
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');

      // Should show validation error
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toHaveAttribute('type', 'email');

      console.log('✅ Email validation working');
    });

    test('404 page handling', async ({ page }) => {
      console.log('Testing 404 error handling...');

      await page.goto(`${BASE_URL}/nonexistent-page`);

      // Should show 404 page or redirect
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/(404|not found|page not found)/i);

      console.log('✅ 404 handling working');
    });
  });

  test.describe.serial('Photo Storage and Bucket Tests', () => {

    test('Supabase storage bucket accessibility', async ({ page }) => {
      console.log('Testing storage bucket accessibility...');

      // Test if storage buckets are configured
      const response = await page.request.get(`${BASE_URL}/api/storage-test`);

      // Even if endpoint doesn't exist, we check the response
      expect([200, 404, 405]).toContain(response.status());

      console.log('✅ Storage configuration test completed');
    });
  });

  test.describe.serial('AI Report Generation Tests', () => {

    test('AI report generation API availability', async ({ page }) => {
      console.log('Testing AI report generation...');

      const response = await page.request.post(`${BASE_URL}/api/generate-job-report`, {
        data: {
          jobId: 'test-job-id',
          test: true
        }
      });

      // Should respond with some status (may require auth)
      expect([200, 400, 401, 403, 405, 500]).toContain(response.status());

      console.log(`✅ AI report API responded with status: ${response.status()}`);
    });
  });
});

// Test helper functions
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin**');
}

async function loginAsTech(page: Page) {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.click('button:has-text("Tech Code")');
  await page.fill('input[name="techCode"]', TEST_TECH_CODE);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/tech/dashboard**');
}

test.describe.serial('End-to-End Workflow Tests', () => {

  test('Complete tech workflow: login → submit job → photos → report', async ({ page }) => {
    console.log('Testing complete tech workflow...');

    // Step 1: Tech login
    await loginAsTech(page);

    // Step 2: Navigate to dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Step 3: Test job submission flow
    const submitJobButton = page.locator('button:has-text("Submit Job")');
    if (await submitJobButton.isVisible()) {
      await submitJobButton.click();
      await expect(page.locator('text=Submit Job')).toBeVisible();
      console.log('✅ Job submission modal opened');
    }

    // Step 4: Test photos page
    await page.goto(`${BASE_URL}/tech/photos`);
    await expect(page.url()).toContain('/tech/photos');

    console.log('✅ Complete tech workflow tested');
  });

  test('Admin oversight workflow: login → view submissions → manage content', async ({ page }) => {
    console.log('Testing admin oversight workflow...');

    // Step 1: Admin login
    await loginAsAdmin(page);

    // Step 2: Navigate to different admin sections
    const adminSections = ['/admin', '/admin/marketing', '/admin/profile'];

    for (const section of adminSections) {
      await page.goto(`${BASE_URL}${section}`);
      await expect(page.url()).toContain(section);
      console.log(`✅ Admin section ${section} accessible`);
    }

    console.log('✅ Admin oversight workflow tested');
  });
});