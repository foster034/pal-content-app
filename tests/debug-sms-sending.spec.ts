import { test, expect } from '@playwright/test';

test.describe('Debug SMS Sending Issue', () => {
  test('should debug why SMS is not sending with valid Twilio credentials', async ({ page }) => {
    console.log('🔍 Starting SMS Sending Debug Test');

    // Step 1: Login
    console.log('\n📍 Step 1: Logging in as admin...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input#email', 'admin@test.ca');
    await page.fill('input#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 10000 });
    console.log('✅ Login successful');

    // Step 2: Navigate to SMS Settings
    console.log('\n📍 Step 2: Navigating to SMS settings...');
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForLoadState('networkidle');
    await page.click('text=SMS');
    await page.waitForTimeout(1000);

    // Step 3: Check current configuration
    console.log('\n📍 Step 3: Checking current SMS configuration...');
    const enableSMSSwitch = page.locator('button[data-slot="switch"]').first();
    const testModeSwitch = page.locator('button[data-slot="switch"]').nth(1);

    const smsEnabledState = await enableSMSSwitch.getAttribute('data-state');
    const testModeState = await testModeSwitch.getAttribute('data-state');

    console.log(`📊 Current Configuration:`);
    console.log(`  SMS Enabled: ${smsEnabledState}`);
    console.log(`  Test Mode: ${testModeState}`);

    // Check connection status
    const hasConnected = await page.locator('text=Connected').isVisible({ timeout: 2000 }).catch(() => false);
    const hasDisconnected = await page.locator('text=Not Connected').isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`  Connection Status: ${hasConnected ? 'Connected' : hasDisconnected ? 'Not Connected' : 'Unknown'}`);

    // Check if auth token field shows dots (indicating it's set)
    const authTokenInput = page.locator('input#twilio-auth-token');
    const authTokenValue = await authTokenInput.inputValue();
    console.log(`  Auth Token Field: ${authTokenValue ? (authTokenValue.includes('•') ? 'Set (hidden)' : 'Has value') : 'Empty'}`);

    // Check Account SID
    const accountSidInput = page.locator('input#twilio-account-sid');
    const accountSidValue = await accountSidInput.inputValue();
    console.log(`  Account SID: ${accountSidValue ? accountSidValue.substring(0, 10) + '...' : 'Empty'}`);

    // Check Phone Number
    const phoneNumberInput = page.locator('input#twilio-phone-number');
    const phoneNumberValue = await phoneNumberInput.inputValue();
    console.log(`  Phone Number: ${phoneNumberValue || 'Empty'}`);

    await page.screenshot({ path: 'test-results/debug-sms-config-before.png', fullPage: true });

    // Step 4: Ensure SMS is enabled
    console.log('\n📍 Step 4: Ensuring SMS is enabled...');
    if (smsEnabledState !== 'checked') {
      console.log('Enabling SMS...');
      await enableSMSSwitch.click();
      await page.waitForTimeout(500);
    }

    // Step 5: Turn OFF Test Mode
    console.log('\n📍 Step 5: Turning Test Mode OFF...');
    if (testModeState === 'checked') {
      console.log('Disabling Test Mode...');
      await testModeSwitch.click();
      await page.waitForTimeout(500);
      const newTestModeState = await testModeSwitch.getAttribute('data-state');
      console.log(`Test Mode after toggle: ${newTestModeState}`);
    } else {
      console.log('Test Mode is already OFF');
    }

    // Step 6: Save settings
    console.log('\n📍 Step 6: Saving SMS settings...');
    await page.click('button:has-text("Save SMS Settings")');

    // Wait for success or error toast
    await page.waitForTimeout(2000);

    // Check for any error messages
    const errorToast = await page.locator('text=/error|failed/i').isVisible({ timeout: 1000 }).catch(() => false);
    if (errorToast) {
      console.log('❌ Error saving settings!');
      const errorText = await page.locator('text=/error|failed/i').first().textContent();
      console.log(`Error message: ${errorText}`);
    } else {
      console.log('✅ Settings saved successfully');
    }

    await page.screenshot({ path: 'test-results/debug-sms-config-after-save.png', fullPage: true });

    // Step 7: Refresh and verify Test Mode is still OFF
    console.log('\n📍 Step 7: Refreshing page to verify settings persisted...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('text=SMS');
    await page.waitForTimeout(1000);

    const testModeSwitchAfterRefresh = page.locator('button[data-slot="switch"]').nth(1);
    const finalTestModeState = await testModeSwitchAfterRefresh.getAttribute('data-state');
    console.log(`Test Mode after refresh: ${finalTestModeState}`);

    if (finalTestModeState === 'checked') {
      console.log('⚠️  WARNING: Test Mode turned back ON after refresh! This might be the issue.');
    } else {
      console.log('✅ Test Mode is still OFF');
    }

    // Step 8: Try to send test SMS
    console.log('\n📍 Step 8: Attempting to send test SMS...');
    const testPhoneNumber = '+17059845625';

    await page.fill('input#test-phone-number', testPhoneNumber);
    console.log(`📱 Sending test SMS to: ${testPhoneNumber}`);

    // Listen for network requests
    const smsRequestPromise = page.waitForResponse(
      response => response.url().includes('/api/twilio/send-sms'),
      { timeout: 10000 }
    );

    await page.click('button:has-text("Test SMS")');

    try {
      const smsResponse = await smsRequestPromise;
      const responseStatus = smsResponse.status();
      const responseBody = await smsResponse.json().catch(() => ({}));

      console.log(`\n📡 SMS API Response:`);
      console.log(`  Status: ${responseStatus}`);
      console.log(`  Body:`, JSON.stringify(responseBody, null, 2));

      if (responseStatus === 200) {
        if (responseBody.testMode) {
          console.log('⚠️  SMS was sent in TEST MODE (not real SMS)');
        } else {
          console.log('✅ SMS sent successfully in LIVE MODE!');
        }
      } else {
        console.log(`❌ SMS failed with status ${responseStatus}`);
        if (responseBody.error) {
          console.log(`Error: ${responseBody.error}`);
          if (responseBody.code) {
            console.log(`Twilio Error Code: ${responseBody.code}`);
          }
        }
      }
    } catch (error) {
      console.log('❌ Failed to capture SMS response:', error);
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/debug-sms-after-send.png', fullPage: true });

    // Step 9: Check server logs hint
    console.log('\n📊 SUMMARY:');
    console.log('============================================');
    console.log('Check your server terminal logs for:');
    console.log('1. "📱 SMS TEST MODE" = Still in test mode');
    console.log('2. "📱 SMS SENT SUCCESSFULLY" = Real SMS sent');
    console.log('3. "SMS sending error" = Error details');
    console.log('4. HTTP 403 = Authentication issue');
    console.log('5. HTTP 400 = Validation/parameter issue');
    console.log('============================================');

    // Step 10: Fetch config via API to see what's actually stored
    console.log('\n📍 Step 9: Fetching current config from API...');
    const configResponse = await page.evaluate(async () => {
      const response = await fetch('/api/twilio/config');
      return await response.json();
    });

    console.log('\n📋 Current Config from API:');
    console.log(JSON.stringify(configResponse, null, 2));
  });
});
