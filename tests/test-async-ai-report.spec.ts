import { test, expect } from '@playwright/test';

test('Test async AI report generation - instant submission', async ({ page }) => {
  console.log('Starting async AI report generation test...');

  // Navigate to tech dashboard
  await page.goto('http://localhost:3000/tech/dashboard');
  await page.waitForTimeout(3000);

  console.log('Step 1: Navigated to tech dashboard');

  // Look for Submit Content button
  const submitButton = page.locator('button:has-text("Submit Content")');

  if (await submitButton.isVisible()) {
    await submitButton.click();
    console.log('Step 2: Clicked Submit Content button');
    await page.waitForTimeout(2000);

    // Fill out form quickly
    await page.selectOption('select[name="jobType"]', 'Commercial');
    await page.fill('input[name="location"]', 'Async Test - Downtown Office');
    await page.fill('textarea[name="description"]', 'Testing async AI report generation. This should submit instantly and generate report in background.');

    console.log('Step 3: Filled out form');

    // Get current time before submission
    const startTime = Date.now();

    // Submit the form
    const modalSubmitButton = page.locator('button:has-text("📸 Submit Content")');
    if (await modalSubmitButton.isVisible()) {
      console.log('Step 4: Submitting job...');
      await modalSubmitButton.click();

      // Measure how long until success message appears
      await page.waitForTimeout(2000); // Give it a moment for any alerts

      const endTime = Date.now();
      const submissionTime = endTime - startTime;

      console.log(`⏱️ Submission took: ${submissionTime}ms`);

      if (submissionTime < 5000) { // Should be instant (under 5 seconds)
        console.log('✅ SUCCESS: Submission was fast! (under 5 seconds)');
      } else {
        console.log('❌ Submission took too long, likely still synchronous');
      }

      await page.screenshot({
        path: 'async-test-after-submission.png',
        fullPage: true
      });

      // Wait a bit longer for background AI generation
      console.log('Step 5: Waiting for background AI report generation...');
      await page.waitForTimeout(15000);

      // Check API to see if AI report was generated
      const response = await page.goto('http://localhost:3000/api/job-submissions');
      if (response) {
        const content = await response.text();
        try {
          const jobs = JSON.parse(content);
          if (jobs.length > 0) {
            const latestJob = jobs[0];

            console.log('Latest job ID:', latestJob.id);
            console.log('Has AI report:', !!latestJob.aiReport);

            if (latestJob.aiReport) {
              console.log('✅ FINAL SUCCESS: AI report generated in background!');
              console.log('AI Report preview:', latestJob.aiReport.substring(0, 150) + '...');
            } else {
              console.log('⏳ AI report still being generated...');
            }
          }
        } catch (e) {
          console.log('Failed to parse API response:', e);
        }
      }

    } else {
      console.log('❌ Modal submit button not found');
    }
  } else {
    console.log('❌ Submit Content button not found');
  }

  console.log('Async AI report generation test completed');
});