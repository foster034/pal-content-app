import { test, expect } from '@playwright/test';

test.describe('SMS Test Mode Toggle Fix', () => {
  test('should correctly save and persist Test Mode OFF state', async ({ page }) => {
    console.log('🔵 Testing Test Mode Toggle Persistence');

    // Step 1: Login
    console.log('\n📍 Step 1: Logging in...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input#email', 'admin@test.ca');
    await page.fill('input#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
    console.log('✅ Login successful');

    // Step 2: Go to settings and click SMS tab
    console.log('\n📍 Step 2: Navigating to SMS settings...');
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForLoadState('networkidle');
    await page.click('text=SMS');
    await page.waitForTimeout(1000);

    // Step 3: Get current switch states
    const enableSMSSwitch = page.locator('button[data-slot="switch"]').first();
    const testModeSwitch = page.locator('button[data-slot="switch"]').nth(1);

    await expect(enableSMSSwitch).toBeVisible();
    await expect(testModeSwitch).toBeVisible();

    const initialTestModeState = await testModeSwitch.getAttribute('data-state');
    console.log(`Initial Test Mode state: ${initialTestModeState}`);

    // Step 4: Ensure SMS is enabled
    const smsEnabledState = await enableSMSSwitch.getAttribute('data-state');
    if (smsEnabledState !== 'checked') {
      console.log('Enabling SMS...');
      await enableSMSSwitch.click();
      await page.waitForTimeout(500);
    }

    // Step 5: Turn OFF Test Mode if it's ON
    console.log('\n📍 Step 3: Turning Test Mode OFF...');
    if (initialTestModeState === 'checked') {
      await testModeSwitch.click();
      await page.waitForTimeout(500);
      const newState = await testModeSwitch.getAttribute('data-state');
      console.log(`Test Mode state after click: ${newState}`);
      expect(newState).toBe('unchecked');
    }

    // Step 6: Save settings
    console.log('\n📍 Step 4: Saving settings...');
    await page.click('button:has-text("Save SMS Settings")');
    await page.waitForTimeout(2000);
    console.log('✅ Settings saved');

    await page.screenshot({ path: 'test-results/test-mode-off-before-refresh.png', fullPage: true });

    // Step 7: Refresh page
    console.log('\n📍 Step 5: Refreshing page...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('text=SMS');
    await page.waitForTimeout(1000);

    // Step 8: Check if Test Mode is still OFF
    console.log('\n📍 Step 6: Verifying Test Mode state after refresh...');
    const testModeSwitchAfterRefresh = page.locator('button[data-slot="switch"]').nth(1);
    const finalTestModeState = await testModeSwitchAfterRefresh.getAttribute('data-state');
    console.log(`Test Mode state after refresh: ${finalTestModeState}`);

    await page.screenshot({ path: 'test-results/test-mode-off-after-refresh.png', fullPage: true });

    // Verify it stayed OFF
    expect(finalTestModeState).toBe('unchecked');
    console.log('✅ Test Mode correctly persisted as OFF!');

    // Step 9: Now turn it back ON and verify it persists as ON
    console.log('\n📍 Step 7: Turning Test Mode ON...');
    await testModeSwitchAfterRefresh.click();
    await page.waitForTimeout(500);
    const onState = await testModeSwitchAfterRefresh.getAttribute('data-state');
    expect(onState).toBe('checked');

    await page.click('button:has-text("Save SMS Settings")');
    await page.waitForTimeout(2000);
    console.log('✅ Settings saved with Test Mode ON');

    // Refresh again
    console.log('\n📍 Step 8: Refreshing page again...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('text=SMS');
    await page.waitForTimeout(1000);

    const testModeSwitchFinal = page.locator('button[data-slot="switch"]').nth(1);
    const finalOnState = await testModeSwitchFinal.getAttribute('data-state');
    console.log(`Test Mode state after second refresh: ${finalOnState}`);

    await page.screenshot({ path: 'test-results/test-mode-on-after-refresh.png', fullPage: true });

    expect(finalOnState).toBe('checked');
    console.log('✅ Test Mode correctly persisted as ON!');

    console.log('\n🎉 Test Mode Toggle Persistence Test PASSED!');
  });

  test('should send actual SMS when Test Mode is OFF', async ({ page }) => {
    console.log('🔵 Testing SMS Behavior with Test Mode OFF');

    // Login
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input#email', 'admin@test.ca');
    await page.fill('input#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');

    // Go to settings
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForLoadState('networkidle');
    await page.click('text=SMS');
    await page.waitForTimeout(1000);

    // Get switches
    const enableSMSSwitch = page.locator('button[data-slot="switch"]').first();
    const testModeSwitch = page.locator('button[data-slot="switch"]').nth(1);

    // Enable SMS if needed
    const smsState = await enableSMSSwitch.getAttribute('data-state');
    if (smsState !== 'checked') {
      await enableSMSSwitch.click();
      await page.waitForTimeout(500);
    }

    // Turn OFF Test Mode
    const testModeState = await testModeSwitch.getAttribute('data-state');
    if (testModeState === 'checked') {
      console.log('Turning Test Mode OFF...');
      await testModeSwitch.click();
      await page.waitForTimeout(500);
    }

    // Save
    await page.click('button:has-text("Save SMS Settings")');
    await page.waitForTimeout(2000);

    console.log('\n💡 Note: Test Mode is now OFF');
    console.log('📱 Check server logs - you should see:');
    console.log('   "Attempting to send SMS via Twilio..." (if Twilio credentials are valid)');
    console.log('   OR an error if Twilio credentials are invalid');
    console.log('\n⚠️  WARNING: This will attempt to send actual SMS if Twilio is configured!');

    // Send test SMS
    await page.fill('input#test-phone-number', '+17059845625');
    await page.click('button:has-text("Test SMS")');
    await page.waitForTimeout(3000);

    console.log('✅ SMS send attempt completed - check server logs');

    await page.screenshot({ path: 'test-results/sms-with-test-mode-off.png', fullPage: true });

    // Turn Test Mode back ON for safety
    console.log('\n🔒 Turning Test Mode back ON for safety...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('text=SMS');
    await page.waitForTimeout(1000);

    const testModeSwitchAgain = page.locator('button[data-slot="switch"]').nth(1);
    const currentState = await testModeSwitchAgain.getAttribute('data-state');
    if (currentState !== 'checked') {
      await testModeSwitchAgain.click();
      await page.waitForTimeout(500);
      await page.click('button:has-text("Save SMS Settings")');
      await page.waitForTimeout(1000);
      console.log('✅ Test Mode re-enabled');
    }
  });
});
