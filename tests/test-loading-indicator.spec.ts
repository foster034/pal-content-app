import { test, expect } from '@playwright/test';

test('Test loading indicator during job submission', async ({ page }) => {
  console.log('Starting loading indicator test...');

  // Navigate to tech dashboard
  await page.goto('http://localhost:3000/tech/dashboard');
  await page.waitForTimeout(3000);

  console.log('Step 1: Navigated to tech dashboard');

  // Look for Submit New Content button
  const submitButton = page.locator('button:has-text("Submit Content")');

  if (await submitButton.isVisible()) {
    await submitButton.click();
    console.log('Step 2: Clicked Submit Content button');
    await page.waitForTimeout(2000);

    // Fill out minimal form to enable submission
    await page.selectOption('select[name="jobType"]', 'Residential');
    await page.fill('input[name="location"]', 'Loading Test Location');
    await page.fill('textarea[name="description"]', 'Testing loading indicator functionality during AI report generation.');

    console.log('Step 3: Filled out basic form');

    await page.screenshot({
      path: 'loading-test-form-ready.png',
      fullPage: true
    });

    // Find the submit button in the modal
    const modalSubmitButton = page.locator('button:has-text("📸 Submit Content")');

    if (await modalSubmitButton.isVisible()) {
      console.log('Step 4: Found modal submit button, clicking to test loading state...');

      // Click submit and immediately check for loading state
      await modalSubmitButton.click();

      // Wait a moment for loading state to appear
      await page.waitForTimeout(1000);

      // Check if loading indicator is visible
      const loadingSpinner = page.locator('.animate-spin');
      const processingText = page.locator('text=Processing AI Report');

      const hasSpinner = await loadingSpinner.isVisible();
      const hasProcessingText = await processingText.isVisible();

      console.log(`Loading spinner visible: ${hasSpinner}`);
      console.log(`Processing text visible: ${hasProcessingText}`);

      if (hasSpinner || hasProcessingText) {
        console.log('✅ SUCCESS: Loading indicator is working!');
        await page.screenshot({
          path: 'loading-test-indicator-visible.png',
          fullPage: true
        });
      } else {
        console.log('❌ Loading indicator not found');
        await page.screenshot({
          path: 'loading-test-indicator-missing.png',
          fullPage: true
        });
      }

      // Wait for submission to complete (up to 30 seconds)
      console.log('Step 5: Waiting for submission to complete...');
      await page.waitForTimeout(15000);

      // Check if submission completed
      const completedSubmitButton = page.locator('button:has-text("📸 Submit Content")');
      const isButtonBackToNormal = await completedSubmitButton.isVisible();

      console.log(`Submit button back to normal: ${isButtonBackToNormal}`);

      await page.screenshot({
        path: 'loading-test-final-state.png',
        fullPage: true
      });

    } else {
      console.log('❌ Modal submit button not found');
    }
  } else {
    console.log('❌ Submit Content button not found');
  }

  console.log('Loading indicator test completed');
});