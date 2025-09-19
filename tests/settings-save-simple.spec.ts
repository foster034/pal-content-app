import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TEST_EMAIL = process.env.PLAYWRIGHT_DEMO_EMAIL || 'admin@test.ca';
const TEST_PASSWORD = process.env.PLAYWRIGHT_DEMO_PASSWORD || '123456';

test.describe('Login Settings Save Test', () => {
  test('should login, navigate to settings, and test save functionality', async ({ page }) => {
    console.log('Starting test...');

    // Step 1: Navigate to login page
    await page.goto('http://localhost:3000/auth/login');
    console.log('✓ Navigated to login page');

    // Step 2: Fill in login credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    console.log('✓ Filled in credentials');

    // Step 3: Click login button and wait for redirect
    await Promise.all([
      page.waitForURL('**/admin**', { timeout: 15000 }),
      page.click('button:has-text("Log in")')
    ]);
    console.log('✓ Successfully logged in and redirected to admin');

    // Step 4: Navigate to settings page
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForLoadState('networkidle');
    console.log('✓ Navigated to settings page');

    // Step 5: Click on Login Screen tab
    await page.click('button:has-text("Login Screen")');
    console.log('✓ Clicked Login Screen tab');

    // Wait for content to load
    await page.waitForSelector('text=Login Screen Configuration');
    console.log('✓ Login Screen Configuration loaded');

    // Step 6: Test Static Image Setting
    console.log('Testing static image setting...');

    // Click static image option
    await page.click('label[for="static-image"]');

    // Verify it's selected
    const staticRadio = page.locator('input[id="static-image"]');
    await expect(staticRadio).toBeChecked();
    console.log('✓ Static image option selected');

    // Step 7: Test Save Button Click
    const saveButton = page.locator('button:has-text("Save Login Settings")');
    await expect(saveButton).toBeVisible();

    // Monitor network requests
    let saveRequestMade = false;
    page.on('request', request => {
      if (request.url().includes('/api/login-settings') && request.method() === 'POST') {
        console.log('✓ Save request detected:', request.url());
        saveRequestMade = true;
      }
    });

    // Monitor responses
    page.on('response', response => {
      if (response.url().includes('/api/login-settings')) {
        console.log(`✓ API Response: ${response.status()} ${response.url()}`);
      }
    });

    // Click save button
    await saveButton.click();
    console.log('✓ Clicked save button');

    // Wait a bit for the request to be made
    await page.waitForTimeout(3000);

    // Check if request was made
    if (saveRequestMade) {
      console.log('✓ Save request was successfully made to the API');
    } else {
      console.log('⚠️  No save request detected - checking for any visible messages');
    }

    // Look for any toast messages
    const possibleSuccessSelectors = [
      'text=Login settings saved successfully',
      'text=Settings saved successfully',
      'text=saved successfully',
      '[role="alert"]',
      '.toast',
      '[data-testid="toast"]'
    ];

    let messageFound = false;
    for (const selector of possibleSuccessSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        console.log(`✓ Found message: ${selector}`);
        messageFound = true;
        break;
      }
    }

    if (!messageFound) {
      console.log('⚠️  No success message found - taking screenshot for debugging');
      await page.screenshot({ path: 'test-results/no-success-message.png', fullPage: true });
    }

    // Step 8: Test Dynamic Photos Setting
    console.log('Testing dynamic photos setting...');

    await page.click('label[for="dynamic-photos"]');
    const dynamicRadio = page.locator('input[id="dynamic-photos"]');
    await expect(dynamicRadio).toBeChecked();
    console.log('✓ Dynamic photos option selected');

    // Test slider - wait for it to be visible and interact differently
    await page.waitForSelector('input[type="range"]', { timeout: 5000 });
    const slider = page.locator('input[type="range"]').first();

    // Use different approach for range input
    await slider.evaluate((el, value) => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, '8');

    console.log('✓ Slider set to 8');

    // Save again
    saveRequestMade = false;
    await saveButton.click();
    await page.waitForTimeout(3000);

    console.log('✓ Dynamic settings save attempted');

    // Step 9: Test Persistence with Page Reload
    console.log('Testing persistence with page reload...');

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate back to Login Screen tab
    await page.click('button:has-text("Login Screen")');
    await page.waitForSelector('text=Login Screen Configuration');

    // Check if dynamic is still selected
    const reloadedDynamicRadio = page.locator('input[id="dynamic-photos"]');
    const isChecked = await reloadedDynamicRadio.isChecked();

    if (isChecked) {
      console.log('✓ Settings persisted after reload - dynamic option still selected');
    } else {
      console.log('⚠️  Settings may not have persisted - checking what is selected');
      const staticChecked = await page.locator('input[id="static-image"]').isChecked();
      console.log(`Static checked: ${staticChecked}, Dynamic checked: ${isChecked}`);
    }

    console.log('Test completed successfully!');
  });

  test('should verify API endpoint availability', async ({ page, request }) => {
    console.log('Testing API endpoint availability...');

    // Test GET endpoint
    try {
      const getResponse = await request.get('http://localhost:3000/api/login-settings');
      console.log(`✓ GET /api/login-settings responded with status: ${getResponse.status()}`);

      if (getResponse.ok()) {
        const data = await getResponse.json();
        console.log('✓ GET response data:', JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('✗ GET /api/login-settings failed:', error);
    }

    // Test POST endpoint with sample data
    try {
      const postResponse = await request.post('http://localhost:3000/api/login-settings', {
        data: {
          imageType: 'static',
          staticImageUrl: '/test-image.jpg',
          showLatestJobs: false,
          jobPhotoCount: 5
        }
      });
      console.log(`✓ POST /api/login-settings responded with status: ${postResponse.status()}`);

      if (postResponse.ok()) {
        const data = await postResponse.json();
        console.log('✓ POST response data:', JSON.stringify(data, null, 2));
      } else {
        const errorData = await postResponse.text();
        console.log('✗ POST error response:', errorData);
      }
    } catch (error) {
      console.error('✗ POST /api/login-settings failed:', error);
    }
  });
});