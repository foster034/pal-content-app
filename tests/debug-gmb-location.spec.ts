import { test, expect } from '@playwright/test';

test.describe('GMB Location Update Debug', () => {
  test('debug location save issue', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log(`BROWSER: ${msg.type()}: ${msg.text()}`));

    // Capture network responses
    page.on('response', async response => {
      if (response.url().includes('/api/gmb')) {
        console.log(`\n🌐 NETWORK: ${response.request().method()} ${response.url()}`);
        console.log(`   Status: ${response.status()}`);
        try {
          const body = await response.json();
          console.log(`   Response:`, JSON.stringify(body, null, 2));
        } catch (e) {
          const text = await response.text();
          console.log(`   Response text:`, text);
        }
      }
    });

    // Capture network requests
    page.on('request', request => {
      if (request.url().includes('/api/gmb')) {
        console.log(`\n📤 REQUEST: ${request.method()} ${request.url()}`);
        if (request.postData()) {
          console.log(`   Body:`, request.postData());
        }
      }
    });

    // 1. Login
    console.log('\n🔐 Starting login...');
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"]', 'admin@test.ca');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/**', { timeout: 10000 });
    console.log('✅ Login successful');

    // 2. Navigate to franchisee settings
    console.log('\n📍 Navigating to franchisee settings...');
    await page.goto('http://localhost:3000/dashboard/franchisees/4c8b70f3-797b-4384-869e-e1fb3919f615');
    await page.waitForLoadState('networkidle');
    console.log('✅ On franchisee settings page');

    // 3. Take a screenshot before interaction
    await page.screenshot({ path: '/Users/brentfoster/PAL CONTENT APP/debug-before.png', fullPage: true });
    console.log('📸 Screenshot saved: debug-before.png');

    // 4. Try to find and interact with GMB location input
    console.log('\n🔍 Looking for GMB Connection Card...');

    // Wait for the page to load
    await page.waitForTimeout(2000);

    // Check if GMB card exists
    const gmbCard = page.locator('text=GMB Connection').first();
    if (await gmbCard.count() > 0) {
      console.log('✅ Found GMB Connection card');

      // Look for location input
      const locationInput = page.locator('input[placeholder*="location" i], input[value*="locations/" i], input[type="text"]').first();
      if (await locationInput.count() > 0) {
        console.log('✅ Found location input');

        // Clear and fill the location ID
        await locationInput.clear();
        await locationInput.fill('accounts/demo123456/locations/demo789012');
        console.log('✅ Filled location ID');

        // Find and click save button
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        if (await saveButton.count() > 0) {
          console.log('🔵 Clicking save button...');

          // Wait for network response
          const responsePromise = page.waitForResponse(
            response => response.url().includes('/api/gmb/update-location'),
            { timeout: 10000 }
          );

          await saveButton.click();

          try {
            const response = await responsePromise;
            console.log(`\n📥 Got response: ${response.status()}`);
            const responseBody = await response.json();
            console.log('Response body:', JSON.stringify(responseBody, null, 2));
          } catch (e) {
            console.error('❌ Error waiting for response:', e);
          }

          // Wait a bit to see any UI updates
          await page.waitForTimeout(2000);
        } else {
          console.log('❌ Save button not found');
        }
      } else {
        console.log('❌ Location input not found');
      }
    } else {
      console.log('❌ GMB Connection card not found');
    }

    // Take final screenshot
    await page.screenshot({ path: '/Users/brentfoster/PAL CONTENT APP/debug-after.png', fullPage: true });
    console.log('📸 Screenshot saved: debug-after.png');

    // Keep browser open for a bit
    await page.waitForTimeout(3000);
  });
});
