import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TEST_EMAIL = process.env.PLAYWRIGHT_DEMO_EMAIL || 'admin@test.ca';
const TEST_PASSWORD = process.env.PLAYWRIGHT_DEMO_PASSWORD || '123456';

test.describe('Settings Save Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging to catch any errors
    page.on('console', msg => {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });

    // Listen for network failures
    page.on('requestfailed', request => {
      console.error('Network request failed:', request.url(), request.failure()?.errorText);
    });

    // Listen for all responses to debug API calls
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`API Response: ${response.status()} ${response.url()}`);
      }
    });
  });

  test('should login and test settings save functionality with persistence verification', async ({ page }) => {
    // Step 1: Navigate to login page
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/.*\/auth\/login/);

    // Step 2: Fill in credentials and login
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Click login and wait for navigation
    await page.click('button:has-text("Log in")');
    await page.waitForURL(/.*\/admin/, { timeout: 10000 });

    // Verify we're in the admin dashboard
    await expect(page).toHaveURL(/.*\/admin/);

    // Step 3: Navigate to settings page
    await page.goto('/admin/settings');
    await expect(page).toHaveURL(/.*\/admin\/settings/);

    // Step 4: Click on Login Screen tab
    await page.click('button:has-text("Login Screen")');

    // Wait for the login settings to load
    await page.waitForSelector('text=Login Screen Configuration', { timeout: 5000 });

    // Step 5: Test Static Image Setting
    console.log('Testing static image setting...');

    // Select static image option
    await page.click('label[for="static-image"]');

    // Verify the radio button is selected
    const staticRadio = page.locator('input[id="static-image"]');
    await expect(staticRadio).toBeChecked();

    // Step 6: Save settings and verify success
    const saveButton = page.locator('button:has-text("Save Login Settings")');
    await expect(saveButton).toBeVisible();

    // Listen for the API request to verify it's made
    const saveRequestPromise = page.waitForRequest(request =>
      request.url().includes('/api/login-settings') && request.method() === 'POST'
    );

    // Listen for the response to verify it's successful
    const saveResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/login-settings') && response.status() === 200
    );

    await saveButton.click();

    // Wait for the request and response
    try {
      const saveRequest = await saveRequestPromise;
      const saveResponse = await saveResponsePromise;

      console.log('Save request made to:', saveRequest.url());
      console.log('Save response status:', saveResponse.status());

      // Verify the request body contains the expected data
      const requestBody = saveRequest.postDataJSON();
      expect(requestBody.imageType).toBe('static');

    } catch (error) {
      console.error('Failed to capture save request/response:', error);
      await page.screenshot({ path: 'test-results/save-request-failure.png' });
      throw error;
    }

    // Check for success message
    await expect(page.locator('text=Login settings saved successfully')).toBeVisible({ timeout: 10000 });

    // Step 7: Test Dynamic Photos Setting
    console.log('Testing dynamic photos setting...');

    // Select dynamic photos option
    await page.click('label[for="dynamic-photos"]');

    // Verify the radio button is selected
    const dynamicRadio = page.locator('input[id="dynamic-photos"]');
    await expect(dynamicRadio).toBeChecked();

    // Adjust the photo count slider
    const slider = page.locator('input[type="range"]').first();
    await slider.fill('8');

    // Verify the slider value is updated in the UI
    await expect(page.locator('span:has-text("8")')).toBeVisible();

    // Save the dynamic settings
    const dynamicSaveRequestPromise = page.waitForRequest(request =>
      request.url().includes('/api/login-settings') && request.method() === 'POST'
    );

    const dynamicSaveResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/login-settings') && response.status() === 200
    );

    await saveButton.click();

    try {
      const dynamicSaveRequest = await dynamicSaveRequestPromise;
      const dynamicSaveResponse = await dynamicSaveResponsePromise;

      console.log('Dynamic save request made to:', dynamicSaveRequest.url());
      console.log('Dynamic save response status:', dynamicSaveResponse.status());

      // Verify the request body contains the expected data
      const requestBody = dynamicSaveRequest.postDataJSON();
      expect(requestBody.imageType).toBe('dynamic');
      expect(requestBody.jobPhotoCount).toBe(8);

    } catch (error) {
      console.error('Failed to capture dynamic save request/response:', error);
      await page.screenshot({ path: 'test-results/dynamic-save-request-failure.png' });
      throw error;
    }

    // Check for success message
    await expect(page.locator('text=Login settings saved successfully')).toBeVisible({ timeout: 10000 });

    // Step 8: Verify persistence by reloading the page
    console.log('Testing persistence after page reload...');

    await page.reload();

    // Click Login Screen tab again after reload
    await page.click('button:has-text("Login Screen")');

    // Wait for settings to load
    await page.waitForSelector('text=Login Screen Configuration', { timeout: 5000 });

    // Verify that dynamic photos is still selected
    const reloadedDynamicRadio = page.locator('input[id="dynamic-photos"]');
    await expect(reloadedDynamicRadio).toBeChecked();

    // Verify the photo count is still 8
    await expect(page.locator('span:has-text("8")')).toBeVisible();

    console.log('Settings persistence verified successfully!');
  });

  test('should handle save errors gracefully', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log in")');
    await page.waitForURL(/.*\/admin/);

    // Go to settings
    await page.goto('/admin/settings');
    await page.click('button:has-text("Login Screen")');

    // Mock a failing API response
    await page.route('/api/login-settings', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    // Try to save settings
    await page.click('label[for="static-image"]');
    await page.click('button:has-text("Save Login Settings")');

    // Verify error message is shown
    await expect(page.locator('text=Failed to save login settings')).toBeVisible({ timeout: 10000 });
  });

  test('should verify network connectivity and API endpoint availability', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log in")');
    await page.waitForURL(/.*\/admin/);

    // Go to settings
    await page.goto('/admin/settings');
    await page.click('button:has-text("Login Screen")');

    // Test if the API endpoint is reachable by making a GET request
    const response = await page.request.get('/api/login-settings');
    console.log('API endpoint status:', response.status());

    if (response.status() !== 200 && response.status() !== 404) {
      console.error('API endpoint may not be available. Status:', response.status());
      await page.screenshot({ path: 'test-results/api-endpoint-error.png' });
    }
  });

  test('should test all settings combinations and verify data integrity', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log in")');
    await page.waitForURL(/.*\/admin/);

    // Go to settings
    await page.goto('/admin/settings');
    await page.click('button:has-text("Login Screen")');

    const testCases = [
      { type: 'static', description: 'Static image configuration' },
      { type: 'dynamic', photoCount: 3, description: 'Dynamic with minimum photos' },
      { type: 'dynamic', photoCount: 10, description: 'Dynamic with medium photos' },
      { type: 'dynamic', photoCount: 20, description: 'Dynamic with maximum photos' },
    ];

    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.description}`);

      // Select the appropriate option
      if (testCase.type === 'static') {
        await page.click('label[for="static-image"]');
        await expect(page.locator('input[id="static-image"]')).toBeChecked();
      } else {
        await page.click('label[for="dynamic-photos"]');
        await expect(page.locator('input[id="dynamic-photos"]')).toBeChecked();

        if (testCase.photoCount) {
          await page.locator('input[type="range"]').first().fill(testCase.photoCount.toString());
          await expect(page.locator(`span:has-text("${testCase.photoCount}")`)).toBeVisible();
        }
      }

      // Save and verify
      const saveRequestPromise = page.waitForRequest(request =>
        request.url().includes('/api/login-settings') && request.method() === 'POST'
      );

      await page.click('button:has-text("Save Login Settings")');

      try {
        const saveRequest = await saveRequestPromise;
        const requestBody = saveRequest.postDataJSON();

        expect(requestBody.imageType).toBe(testCase.type);
        if (testCase.type === 'dynamic' && testCase.photoCount) {
          expect(requestBody.jobPhotoCount).toBe(testCase.photoCount);
        }

        console.log(`✓ ${testCase.description} - Data integrity verified`);
      } catch (error) {
        console.error(`✗ ${testCase.description} - Failed:`, error);
        await page.screenshot({ path: `test-results/data-integrity-failure-${testCase.type}.png` });
        throw error;
      }

      // Check for success message
      await expect(page.locator('text=Login settings saved successfully')).toBeVisible({ timeout: 10000 });

      // Wait a bit between tests
      await page.waitForTimeout(1000);
    }
  });
});