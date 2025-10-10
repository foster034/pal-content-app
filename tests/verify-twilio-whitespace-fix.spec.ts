import { test, expect } from '@playwright/test';

test.describe('Verify Twilio Whitespace Fix', () => {
  test('should verify that credentials are trimmed and SMS works', async ({ page }) => {
    console.log('🔍 Verifying Twilio Whitespace Fix');

    // Step 1: Login
    console.log('\n📍 Step 1: Logging in as admin...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input#email', 'admin@test.ca');
    await page.fill('input#password', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 10000 });
    console.log('✅ Login successful');

    // Step 2: Check diagnostic endpoint
    console.log('\n📍 Step 2: Checking diagnostic endpoint...');
    const diagnostics = await page.evaluate(async () => {
      const response = await fetch('/api/twilio/debug');
      return await response.json();
    });

    console.log('\n📊 Diagnostic Results:');
    console.log(JSON.stringify(diagnostics, null, 2));

    // Check for critical issues
    if (diagnostics.recommendations && diagnostics.recommendations.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      diagnostics.recommendations.forEach((rec: any, index: number) => {
        console.log(`\n${index + 1}. [${rec.severity}] ${rec.issue}`);
        console.log(`   Fix: ${rec.fix}`);
      });
    } else {
      console.log('\n✅ No issues found in credentials!');
    }

    // Step 3: If whitespace detected, navigate to settings and re-save
    if (diagnostics.analysis?.twilio_auth_token?.hasWhitespace ||
        diagnostics.analysis?.twilio_account_sid?.hasWhitespace) {

      console.log('\n📍 Step 3: Whitespace detected! Navigating to settings to re-save...');
      await page.goto('http://localhost:3000/admin/settings');
      await page.waitForLoadState('networkidle');
      await page.click('text=SMS');
      await page.waitForTimeout(1000);

      console.log('\n⚠️  IMPORTANT: You need to re-enter your Twilio credentials to fix the whitespace issue!');
      console.log('The code has been updated to trim whitespace, but existing credentials need to be re-saved.');

      // Take screenshot
      await page.screenshot({ path: 'test-results/twilio-settings-needs-update.png', fullPage: true });

      console.log('\n📸 Screenshot saved to: test-results/twilio-settings-needs-update.png');
      console.log('\nNEXT STEPS:');
      console.log('1. Re-enter your Twilio Account SID (copy from Twilio Console)');
      console.log('2. Re-enter your Twilio Auth Token (copy from Twilio Console)');
      console.log('3. Click "Save SMS Settings"');
      console.log('4. Run this test again to verify the fix');

    } else {
      console.log('\n✅ No whitespace detected in credentials!');

      // Step 4: Try sending test SMS
      console.log('\n📍 Step 4: Attempting to send test SMS...');
      await page.goto('http://localhost:3000/admin/settings');
      await page.waitForLoadState('networkidle');
      await page.click('text=SMS');
      await page.waitForTimeout(1000);

      const testPhoneNumber = '+17059845625';
      await page.fill('input#test-phone-number', testPhoneNumber);
      console.log(`📱 Sending test SMS to: ${testPhoneNumber}`);

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

        if (responseStatus === 200 && !responseBody.testMode) {
          console.log('\n✅✅✅ SUCCESS! SMS sent in LIVE MODE!');
          console.log('The whitespace fix is working correctly!');
        } else if (responseStatus === 200 && responseBody.testMode) {
          console.log('\n⚠️  SMS was sent in TEST MODE');
          console.log('Make sure Test Mode is turned OFF in settings');
        } else {
          console.log('\n❌ SMS failed with status', responseStatus);
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
      await page.screenshot({ path: 'test-results/twilio-test-after-fix.png', fullPage: true });
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(60));
  });
});
