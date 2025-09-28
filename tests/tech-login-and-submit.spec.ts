import { test, expect } from '@playwright/test';

test('Tech login with code 8D0LS9 and test job submission', async ({ page }) => {
  console.log('Testing tech login with code 8D0LS9...');

  // Navigate to tech auth page
  await page.goto('http://localhost:3000/tech-auth');
  await page.waitForLoadState('networkidle');

  // Take screenshot of login page
  await page.screenshot({ path: 'tech-login-page.png', fullPage: true });

  // Enter the login code
  const codeInput = page.locator('input[placeholder*="login code" i], input[type="text"]').first();
  await codeInput.fill('8D0LS9');
  console.log('✅ Entered login code: 8D0LS9');

  // Click login button
  const loginButton = page.locator('button').filter({ hasText: /login with code/i }).first();
  await loginButton.click();
  console.log('✅ Clicked login button');

  // Wait for navigation or error
  await page.waitForTimeout(3000);

  // Check current URL
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);

  if (currentUrl.includes('/tech/dashboard')) {
    console.log('✅ Successfully logged in! Now on tech dashboard');

    // Take screenshot of dashboard
    await page.screenshot({ path: 'tech-dashboard-after-login.png', fullPage: true });

    // Look for submit button
    const submitButton = page.locator('button').filter({ hasText: /submit new content|add content|new job|submit/i }).first();

    if (await submitButton.isVisible()) {
      console.log('✅ Found submit button');

      // Click submit button
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Check if modal opened
      const modal = page.locator('[role="dialog"], .fixed.inset-0, [class*="modal"]').first();
      if (await modal.isVisible()) {
        console.log('✅ Job submission modal opened successfully!');
        await page.screenshot({ path: 'tech-job-submission-modal.png', fullPage: true });

        // Check what step we're on
        const step1 = page.locator('text=/step 1/i, text=/client information/i');
        if (await step1.isVisible()) {
          console.log('✅ On Step 1: Client Information');

          // Try to fill some test data
          const nameInput = page.locator('input[placeholder*="name" i]').first();
          if (await nameInput.isVisible()) {
            await nameInput.fill('Test Client');
            console.log('✅ Filled client name');
          }

          const phoneInput = page.locator('input[placeholder*="phone" i]').first();
          if (await phoneInput.isVisible()) {
            await phoneInput.fill('555-1234');
            console.log('✅ Filled phone number');
          }

          // Look for Next button
          const nextButton = page.locator('button').filter({ hasText: /next/i }).first();
          if (await nextButton.isVisible()) {
            console.log('✅ Next button is available - form is working!');
          }
        }

        console.log('\n🎉 SUCCESS: Tech can access job submission after logging in with code 8D0LS9');
      } else {
        console.log('⚠️ Modal did not open after clicking submit');
      }
    } else {
      console.log('⚠️ Submit button not found on dashboard');

      // List all buttons to debug
      const buttons = await page.$$eval('button', btns =>
        btns.map(btn => btn.textContent?.trim()).filter(Boolean)
      );
      console.log('Available buttons:', buttons);
    }
  } else if (currentUrl.includes('/tech-auth')) {
    console.log('❌ Still on login page - login may have failed');

    // Check for error messages
    const errorMsg = page.locator('text=/error|invalid|incorrect/i').first();
    if (await errorMsg.isVisible()) {
      const errorText = await errorMsg.textContent();
      console.log('Error message:', errorText);
    }

    await page.screenshot({ path: 'tech-login-failed.png', fullPage: true });
  } else {
    console.log('🤔 Redirected to unexpected page:', currentUrl);
    await page.screenshot({ path: 'tech-unexpected-redirect.png', fullPage: true });
  }

  // Monitor console for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser error:', msg.text());
    }
  });

  // Monitor API responses
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`API call: ${response.url()} - Status: ${response.status()}`);
    }
  });

  await page.waitForTimeout(2000);
});