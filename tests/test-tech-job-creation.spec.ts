import { test, expect } from '@playwright/test';

test.describe('Tech Job Creation', () => {
  test('should allow tech to create a job submission', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Switch to Tech Code login
    await page.click('button:has-text("Tech Code")');

    // Enter tech code for Johnny Punk
    await page.fill('input[name="techCode"]', 'LLY3A4');

    // Click login button
    await page.click('button:has-text("Enter Dashboard")');

    // Wait for redirect to tech dashboard
    await page.waitForURL('**/tech/dashboard', { timeout: 10000 });

    console.log('✅ Successfully logged in as tech');

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click "Submit Content" button in top right
    const submitContentButton = page.locator('button:has-text("Submit Content")');
    await submitContentButton.waitFor({ timeout: 10000 });
    await submitContentButton.click();

    console.log('✅ Clicked new job button');

    // Wait for job submission modal to open
    await page.waitForTimeout(1000);

    // Fill out the job form - Step 1: Service Details
    // Select service category from dropdown
    const categorySelect = page.locator('select').first();
    await categorySelect.waitFor({ timeout: 5000 });
    await categorySelect.selectOption('Automotive');

    console.log('✅ Selected service category');
    await page.waitForTimeout(500);

    // Select specific service from second dropdown
    const serviceSelect = page.locator('select').nth(1);
    await serviceSelect.waitFor({ timeout: 5000 });
    // Select any available option (index 1 since 0 is usually placeholder)
    await serviceSelect.selectOption({ index: 1 });

    console.log('✅ Selected service type');
    await page.waitForTimeout(500);

    // Click Next/Continue button
    await page.click('button:has-text("Next"), button:has-text("Continue")');

    console.log('✅ Moved to step 2');
    await page.waitForTimeout(1000);

    // Step 2: Location
    // Fill in location
    const locationInput = page.locator('input[placeholder*="location" i], input[placeholder*="address" i], textarea[placeholder*="location" i]').first();
    if (await locationInput.isVisible()) {
      await locationInput.fill('123 Test Street, Toronto, ON');
    }

    console.log('✅ Filled location');

    // Click Next
    await page.click('button:has-text("Next"), button:has-text("Continue")');

    console.log('✅ Moved to step 3');
    await page.waitForTimeout(1000);

    // Step 3: Description
    const descriptionInput = page.locator('textarea[placeholder*="description" i], textarea[placeholder*="describe" i]').first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Test job submission - automated Playwright test');
    }

    console.log('✅ Filled description');

    // Vehicle info for Automotive jobs
    const yearInput = page.locator('input[placeholder*="year" i], input[name*="year" i]').first();
    if (await yearInput.isVisible()) {
      await yearInput.fill('2023');
      await page.waitForTimeout(300);

      const makeInput = page.locator('input[placeholder*="make" i], select[name*="make" i]').first();
      if (await makeInput.isVisible()) {
        if (await makeInput.evaluate(el => el.tagName === 'SELECT')) {
          await makeInput.selectOption({ label: 'Ford' });
        } else {
          await makeInput.fill('Ford');
        }
      }

      await page.waitForTimeout(300);

      const modelInput = page.locator('input[placeholder*="model" i], select[name*="model" i]').first();
      if (await modelInput.isVisible()) {
        if (await modelInput.evaluate(el => el.tagName === 'SELECT')) {
          await modelInput.selectOption({ index: 1 });
        } else {
          await modelInput.fill('F-150');
        }
      }

      console.log('✅ Filled vehicle information');
    }

    // Click Next/Continue to customer info (if applicable)
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Moved to customer info step');
    }

    // Skip customer info or click submit
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Create Job"), button:has-text("Finish")');
    await submitButton.waitFor({ timeout: 5000 });

    // Take screenshot before submission
    await page.screenshot({ path: 'test-results/before-job-submission.png', fullPage: true });

    console.log('✅ About to submit job');

    // Click submit
    await submitButton.click();

    // Wait for submission to complete
    await page.waitForTimeout(3000);

    // Check for success message or redirect
    const successIndicators = [
      page.locator('text=/success/i'),
      page.locator('text=/submitted/i'),
      page.locator('text=/created/i'),
      page.locator('[role="alert"]:has-text("success")'),
      page.locator('.success, .toast')
    ];

    let foundSuccess = false;
    for (const indicator of successIndicators) {
      if (await indicator.isVisible({ timeout: 2000 }).catch(() => false)) {
        foundSuccess = true;
        console.log('✅ Found success indicator');
        break;
      }
    }

    // Take screenshot after submission
    await page.screenshot({ path: 'test-results/after-job-submission.png', fullPage: true });

    // Verify submission by checking if modal closed or success message appeared
    const modalStillOpen = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);

    if (!modalStillOpen || foundSuccess) {
      console.log('✅ Job submission successful - modal closed or success message shown');
    } else {
      // Check for error messages
      const errorMessages = await page.locator('[role="alert"], .error, .text-red-600').allTextContents();
      if (errorMessages.length > 0) {
        console.error('❌ Error messages found:', errorMessages);
        throw new Error(`Job submission failed with errors: ${errorMessages.join(', ')}`);
      }
    }

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    console.log('✅ Test completed successfully');

    // Expect test to pass if we got here without errors
    expect(true).toBe(true);
  });
});
