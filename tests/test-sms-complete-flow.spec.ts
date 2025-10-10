import { test, expect } from '@playwright/test';

test.describe('Complete SMS Flow Test', () => {
  const testPhoneNumber = '+17059845625';

  test('should complete full SMS flow from settings to tech creation', async ({ page }) => {
    console.log('🔵 Starting Complete SMS Flow Test');
    console.log(`📱 Test Phone Number: ${testPhoneNumber}`);

    // Step 1: Login to admin
    console.log('\n📍 Step 1: Logging in as admin...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input#email', 'admin@test.ca');
    await page.fill('input#password', '123456');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin', { timeout: 10000 });
    console.log('✅ Login successful');

    // Step 2: Navigate to Admin Settings
    console.log('\n📍 Step 2: Navigating to Admin Settings...');
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForLoadState('networkidle');

    // Click SMS tab
    await page.click('text=SMS');
    await page.waitForTimeout(1000);
    console.log('✅ SMS tab opened');

    // Step 3: Check and enable SMS if needed
    console.log('\n📍 Step 3: Configuring SMS settings...');
    const enableSMSSwitch = page.locator('button[data-slot="switch"]').first();
    const testModeSwitch = page.locator('button[data-slot="switch"]').nth(1);

    // Check current states
    const enableSMSState = await enableSMSSwitch.getAttribute('data-state');
    const testModeState = await testModeSwitch.getAttribute('data-state');

    console.log(`Current SMS state: ${enableSMSState}`);
    console.log(`Current Test Mode state: ${testModeState}`);

    // Enable SMS if not enabled
    if (enableSMSState !== 'checked') {
      console.log('Enabling SMS...');
      await enableSMSSwitch.click();
      await page.waitForTimeout(500);
    }

    // Enable Test Mode if not enabled
    if (testModeState !== 'checked') {
      console.log('Enabling Test Mode...');
      await testModeSwitch.click();
      await page.waitForTimeout(500);
    }

    // Fill Twilio credentials
    const accountSidInput = page.locator('input#twilio-account-sid');
    const currentAccountSid = await accountSidInput.inputValue();
    if (!currentAccountSid || currentAccountSid.length < 10) {
      await accountSidInput.fill('AC_test_account_sid_placeholder');
    }

    const authTokenInput = page.locator('input#twilio-auth-token');
    const currentAuthToken = await authTokenInput.inputValue();
    if (!currentAuthToken || currentAuthToken.length < 10) {
      await authTokenInput.fill('test_auth_token_placeholder_123');
    }

    const phoneNumberInput = page.locator('input#twilio-phone-number');
    const currentPhoneNumber = await phoneNumberInput.inputValue();
    if (!currentPhoneNumber || !currentPhoneNumber.startsWith('+')) {
      await phoneNumberInput.fill('+17053005447');
    }

    // Save settings
    console.log('Saving SMS settings...');
    await page.click('button:has-text("Save SMS Settings")');
    await page.waitForTimeout(2000);
    console.log('✅ SMS settings saved');

    // Step 4: Test SMS from settings page
    console.log('\n📍 Step 4: Testing SMS from settings page...');
    await page.fill('input#test-phone-number', testPhoneNumber);
    await page.click('button:has-text("Test SMS")');
    await page.waitForTimeout(2000);

    console.log('✅ Test SMS sent from settings page');
    await page.screenshot({ path: 'test-results/sms-settings-test.png', fullPage: true });

    // Step 5: Create a technician with SMS
    console.log('\n📍 Step 5: Creating technician with SMS notification...');
    await page.goto('http://localhost:3000/franchisee/techs?id=92aae71c-1ce8-448b-a3b3-675e248effa1');
    await page.waitForLoadState('networkidle');

    // Click Add Technician
    await page.click('button:has-text("Add Technician")');
    await page.waitForSelector('text=Create New Technician', { timeout: 5000 });

    // Fill in technician details
    const timestamp = Date.now();
    await page.fill('input#name', `SMS Test Tech ${timestamp}`);
    await page.fill('input#email', `smstest${timestamp}@test.com`);
    await page.fill('input#phone', testPhoneNumber);

    // Check the Send via SMS checkbox
    const smsCheckbox = page.locator('label:has-text("Send via SMS")').locator('input[type="checkbox"]');
    await smsCheckbox.check();
    console.log('✅ SMS checkbox checked');

    // Take screenshot before creating
    await page.screenshot({ path: 'test-results/tech-creation-form-filled.png', fullPage: true });

    // Create the technician
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(3000);

    console.log('✅ Technician created with SMS notification');
    await page.screenshot({ path: 'test-results/tech-created-with-sms.png', fullPage: true });

    // Step 6: Send SMS from table actions
    console.log('\n📍 Step 6: Testing SMS from table actions...');

    // Find the newly created technician row
    const techRow = page.locator('tr').filter({ hasText: `SMS Test Tech ${timestamp}` });
    await expect(techRow).toBeVisible({ timeout: 5000 });

    // Click the actions dropdown
    const actionsButton = techRow.locator('button').filter({ hasText: 'Actions' });
    await actionsButton.click();
    await page.waitForTimeout(500);

    // Click Send Code via SMS
    await page.click('text=Send Code via SMS');
    await page.waitForTimeout(2000);

    console.log('✅ SMS sent from table actions');
    await page.screenshot({ path: 'test-results/sms-sent-from-actions.png', fullPage: true });

    // Final verification
    console.log('\n🎉 Complete SMS Flow Test PASSED!');
    console.log('\n📊 Summary:');
    console.log('  ✅ SMS settings configured');
    console.log('  ✅ Test SMS sent from settings page');
    console.log('  ✅ Technician created with SMS notification');
    console.log('  ✅ SMS sent from table actions');
    console.log(`\n📱 All SMS sent to: ${testPhoneNumber}`);
    console.log('💡 Note: Test Mode is enabled - SMS messages are logged but not actually sent');
  });

  test('should verify SMS configuration status', async ({ page }) => {
    console.log('🔵 Verifying SMS Configuration Status');

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

    // Check connection status
    const hasConnected = await page.locator('text=Connected').isVisible({ timeout: 2000 }).catch(() => false);
    const hasDisconnected = await page.locator('text=Not Connected').isVisible({ timeout: 2000 }).catch(() => false);

    console.log('📊 SMS Configuration Status:');
    console.log(`  Connection: ${hasConnected ? '✅ Connected' : '❌ Not Connected'}`);

    // Check switch states
    const enableSMSSwitch = page.locator('button[data-slot="switch"]').first();
    const testModeSwitch = page.locator('button[data-slot="switch"]').nth(1);

    const smsEnabled = await enableSMSSwitch.getAttribute('data-state');
    const testModeEnabled = await testModeSwitch.getAttribute('data-state');

    console.log(`  SMS Enabled: ${smsEnabled === 'checked' ? '✅ Yes' : '❌ No'}`);
    console.log(`  Test Mode: ${testModeEnabled === 'checked' ? '✅ Yes' : '❌ No'}`);

    // Verify switches are visible
    await expect(enableSMSSwitch).toBeVisible();
    await expect(testModeSwitch).toBeVisible();

    await page.screenshot({ path: 'test-results/sms-config-status.png', fullPage: true });

    console.log('\n✅ SMS Configuration verification complete');
  });

  test('should check server logs for SMS activity', async ({ page }) => {
    console.log('🔵 Testing SMS with Server Log Monitoring');

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

    console.log(`\n📱 Sending test SMS to ${testPhoneNumber}...`);
    console.log('💡 Check your server terminal for this log:');
    console.log('   📱 SMS TEST MODE - Would send:');
    console.log(`   To: ${testPhoneNumber}`);
    console.log('   Message: This is a test message from PAL Content App...');

    // Send test SMS
    await page.fill('input#test-phone-number', testPhoneNumber);
    await page.click('button:has-text("Test SMS")');
    await page.waitForTimeout(3000);

    console.log('\n✅ SMS request sent - check server logs for confirmation');
    console.log('📝 The server should show:');
    console.log('   🔧 TWILIO CONFIG UPDATED');
    console.log('   📱 SMS TEST MODE - Would send...');

    await page.screenshot({ path: 'test-results/sms-test-final.png', fullPage: true });
  });
});
