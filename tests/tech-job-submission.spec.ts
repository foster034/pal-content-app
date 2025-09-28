import { test, expect } from '@playwright/test';

test('Tech job submission debugging', async ({ page }) => {
  console.log('Testing tech job submission...');

  // Navigate to tech dashboard
  await page.goto('http://localhost:3000/tech/dashboard');
  await page.waitForLoadState('networkidle');

  // Check if we need to login
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);

  if (currentUrl.includes('/tech-auth')) {
    console.log('Need to authenticate as tech...');
    // Try to login with test tech credentials or go back
    await page.screenshot({ path: 'tech-auth-required.png' });
  } else if (currentUrl.includes('/tech/dashboard')) {
    console.log('Tech dashboard loaded');
    await page.screenshot({ path: 'tech-dashboard-loaded.png' });

    // Look for the submit button or trigger
    const submitButton = page.locator('button').filter({ hasText: /submit|new content|add|create/i }).first();

    if (await submitButton.isVisible()) {
      console.log('Found submit button, clicking...');

      // Set up console logging
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('Browser console error:', msg.text());
        }
      });

      // Set up request/response monitoring
      page.on('response', response => {
        if (response.url().includes('/api/job-submissions')) {
          console.log('API Response:', response.status(), response.url());
          if (response.status() >= 400) {
            response.text().then(text => {
              console.log('Error response body:', text);
            });
          }
        }
      });

      await submitButton.click();
      await page.waitForTimeout(1000);

      // Take screenshot after clicking
      await page.screenshot({ path: 'tech-after-submit-click.png' });

      // Check if modal opened
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
      if (await modal.isVisible()) {
        console.log('Modal opened successfully');

        // Try to fill the form
        // Check what step we're on
        const stepIndicators = await page.$$('[class*="step"], [class*="progress"]');
        console.log('Found', stepIndicators.length, 'step indicators');

        // Take screenshot of the modal
        await page.screenshot({ path: 'tech-submission-modal.png' });
      } else {
        console.log('No modal found after clicking submit');
      }
    } else {
      console.log('No submit button found on tech dashboard');

      // List all visible buttons
      const buttons = await page.$$eval('button', buttons =>
        buttons.map(btn => btn.textContent?.trim()).filter(Boolean)
      );
      console.log('Available buttons:', buttons);
    }
  }

  // Also check the browser console for any errors
  const logs = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));

  // Wait a bit to collect any console messages
  await page.waitForTimeout(2000);

  if (logs.length > 0) {
    console.log('\nBrowser console logs:');
    logs.forEach(log => {
      if (log.type === 'error' || log.type === 'warning') {
        console.log(`[${log.type}]`, log.text);
      }
    });
  }
});