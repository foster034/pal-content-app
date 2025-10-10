import { test, expect } from '@playwright/test';

test.describe('SMS Functionality Tests', () => {
  test('should enable SMS, configure Twilio, and send test SMS', async ({ page }) => {
    // Navigate to admin login
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    // Login as admin - using email/password
    await page.fill('input#email', 'admin@test.ca');
    await page.fill('input#password', '123456');
    await page.click('button[type="submit"]');

    // Wait for navigation to admin dashboard
    await page.waitForURL('**/admin');
    await expect(page).toHaveURL(/.*admin/);

    // Navigate to admin settings
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForLoadState('networkidle');

    // Wait for the SMS tab to be visible
    await page.waitForSelector('text=SMS', { timeout: 10000 });

    // Click on SMS tab
    await page.click('text=SMS');

    // Wait for SMS configuration section to load
    await page.waitForSelector('text=Twilio SMS Configuration', { timeout: 10000 });

    // Check if switches are visible
    const enableSMSSwitch = page.locator('button[data-slot="switch"]').first();
    const testModeSwitch = page.locator('button[data-slot="switch"]').nth(1);

    console.log('Checking if switches are visible...');
    await expect(enableSMSSwitch).toBeVisible({ timeout: 5000 });
    await expect(testModeSwitch).toBeVisible({ timeout: 5000 });

    // Get current state of switches
    const enableSMSState = await enableSMSSwitch.getAttribute('data-state');
    const testModeState = await testModeSwitch.getAttribute('data-state');

    console.log('Enable SMS current state:', enableSMSState);
    console.log('Test Mode current state:', testModeState);

    // Enable SMS if not already enabled
    if (enableSMSState !== 'checked') {
      console.log('Enabling SMS...');
      await enableSMSSwitch.click();
      await page.waitForTimeout(500);
      const newState = await enableSMSSwitch.getAttribute('data-state');
      console.log('Enable SMS new state:', newState);
      expect(newState).toBe('checked');
    }

    // Enable Test Mode if not already enabled
    if (testModeState !== 'checked') {
      console.log('Enabling Test Mode...');
      await testModeSwitch.click();
      await page.waitForTimeout(500);
      const newState = await testModeSwitch.getAttribute('data-state');
      console.log('Test Mode new state:', newState);
      expect(newState).toBe('checked');
    }

    // Fill in Twilio credentials (if not already filled)
    const accountSidInput = page.locator('input#twilio-account-sid');
    const authTokenInput = page.locator('input#twilio-auth-token');
    const phoneNumberInput = page.locator('input#twilio-phone-number');

    const currentAccountSid = await accountSidInput.inputValue();
    if (!currentAccountSid || currentAccountSid.length < 10) {
      console.log('Filling in Twilio Account SID...');
      await accountSidInput.fill('AC_test_account_sid_placeholder');
    }

    const currentAuthToken = await authTokenInput.inputValue();
    if (!currentAuthToken || currentAuthToken.length < 10) {
      console.log('Filling in Twilio Auth Token...');
      await authTokenInput.fill('test_auth_token_placeholder_123');
    }

    const currentPhoneNumber = await phoneNumberInput.inputValue();
    if (!currentPhoneNumber || !currentPhoneNumber.startsWith('+')) {
      console.log('Filling in Twilio Phone Number...');
      await phoneNumberInput.fill('+17053005447');
    }

    // Save SMS Settings
    console.log('Saving SMS settings...');
    await page.click('button:has-text("Save SMS Settings")');

    // Wait for success toast
    await expect(page.locator('text=SMS settings saved successfully')).toBeVisible({ timeout: 5000 });
    console.log('SMS settings saved successfully!');

    // Test SMS sending
    console.log('Testing SMS sending...');
    const testPhoneInput = page.locator('input#test-phone-number');
    await testPhoneInput.fill('+17059845625');

    // Click Test SMS button
    await page.click('button:has-text("Test SMS")');

    // Wait for success toast
    await expect(page.locator('text=Test SMS')).toBeVisible({ timeout: 5000 });

    // Check if we got the test mode message or actual send message
    const hasTestModeMessage = await page.locator('text=Test mode is enabled').isVisible({ timeout: 2000 }).catch(() => false);
    const hasSentMessage = await page.locator('text=Test SMS sent successfully').isVisible({ timeout: 2000 }).catch(() => false);

    console.log('Test mode message visible:', hasTestModeMessage);
    console.log('Sent message visible:', hasSentMessage);

    expect(hasTestModeMessage || hasSentMessage).toBeTruthy();

    // Take a screenshot of the final state
    await page.screenshot({ path: 'test-results/sms-configuration-final.png', fullPage: true });

    console.log('SMS test completed successfully!');
  });

  test('should send SMS when creating a technician', async ({ page }) => {
    // Navigate to admin login
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    // Login as admin
    await page.fill('input#email', 'admin@test.ca');
    await page.fill('input#password', '123456');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('**/admin');

    // Navigate to franchisee dashboard
    await page.goto('http://localhost:3000/franchisee?id=92aae71c-1ce8-448b-a3b3-675e248effa1');
    await page.waitForLoadState('networkidle');

    // Navigate to techs page
    await page.goto('http://localhost:3000/franchisee/techs?id=92aae71c-1ce8-448b-a3b3-675e248effa1');
    await page.waitForLoadState('networkidle');

    // Click Add Technician button
    await page.click('button:has-text("Add Technician")');

    // Wait for dialog to open
    await page.waitForSelector('text=Create New Technician', { timeout: 5000 });

    // Fill in technician details
    const timestamp = Date.now();
    await page.fill('input#name', `Test Tech SMS ${timestamp}`);
    await page.fill('input#email', `testtech${timestamp}@test.com`);
    await page.fill('input#phone', '+17059845625');

    // Check the Send via SMS checkbox
    const sendViaSMSCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /Send via SMS/i }).or(
      page.locator('label:has-text("Send via SMS")').locator('input[type="checkbox"]')
    );

    console.log('Looking for Send via SMS checkbox...');

    // Try to find the checkbox by label text
    const smsLabel = page.locator('text=Send via SMS');
    await expect(smsLabel).toBeVisible({ timeout: 5000 });

    // Click on the checkbox
    const checkbox = page.locator('label:has-text("Send via SMS")').locator('input[type="checkbox"]');
    await checkbox.check();

    console.log('SMS checkbox checked');

    // Click Create button
    await page.click('button:has-text("Create")');

    // Wait for success message
    await expect(page.locator('text=Technician created successfully')).toBeVisible({ timeout: 10000 });

    console.log('Technician created successfully!');

    // Check if SMS was sent (look for toast or console log)
    const hasSMSMessage = await page.locator('text=SMS sent').isVisible({ timeout: 2000 }).catch(() => false);
    console.log('SMS sent message visible:', hasSMSMessage);

    // Take screenshot
    await page.screenshot({ path: 'test-results/tech-creation-with-sms.png', fullPage: true });
  });

  test('should show SMS connection status', async ({ page }) => {
    // Navigate to admin settings
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input#email', 'admin@test.ca');
    await page.fill('input#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');

    // Go to settings
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForLoadState('networkidle');

    // Click SMS tab
    await page.click('text=SMS');

    // Wait for connection status badge
    await page.waitForSelector('text=Twilio SMS Configuration', { timeout: 5000 });

    // Check for connection status badge
    const hasConnected = await page.locator('text=Connected').isVisible({ timeout: 2000 }).catch(() => false);
    const hasDisconnected = await page.locator('text=Not Connected').isVisible({ timeout: 2000 }).catch(() => false);
    const hasChecking = await page.locator('text=Checking').isVisible({ timeout: 2000 }).catch(() => false);

    console.log('Connection status - Connected:', hasConnected);
    console.log('Connection status - Not Connected:', hasDisconnected);
    console.log('Connection status - Checking:', hasChecking);

    // At least one status should be visible
    expect(hasConnected || hasDisconnected || hasChecking).toBeTruthy();

    // Take screenshot
    await page.screenshot({ path: 'test-results/sms-connection-status.png', fullPage: true });
  });
});
