import { test, expect } from '@playwright/test';

test('Complete AI job report workflow test', async ({ page }) => {
  console.log('Starting complete AI job report workflow test...');

  // Step 1: Navigate to tech dashboard and submit a job
  await page.goto('http://localhost:3000/tech/dashboard');
  await page.waitForTimeout(3000);

  console.log('Step 1: Navigated to tech dashboard');
  await page.screenshot({
    path: 'step1-tech-dashboard.png',
    fullPage: true
  });

  // Click on "Submit New Content" button
  const submitButton = page.locator('button:has-text("Submit New Content")');
  if (await submitButton.isVisible()) {
    await submitButton.click();
    console.log('Step 2: Clicked Submit New Content button');
    await page.waitForTimeout(2000);

    // Take screenshot of modal
    await page.screenshot({
      path: 'step2-submit-modal-opened.png',
      fullPage: true
    });

    // Fill out job submission form
    await page.selectOption('select[name="jobType"]', 'Residential');
    console.log('Selected job type: Residential');

    await page.fill('input[name="location"]', 'Test Location for AI Report');
    console.log('Filled location');

    await page.fill('textarea[name="description"]', 'Test job submission for AI report verification - lock installation with security assessment');
    console.log('Filled description');

    await page.fill('input[name="tags"]', 'AI-test, lock-installation, security');
    console.log('Filled tags');

    // Upload a test image
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Create a simple test image file (we'll use a buffer)
      const testImagePath = '/Users/brentfoster/PAL CONTENT APP/test-image.jpg';

      // For now, let's skip file upload and continue with the rest
      console.log('File upload field detected but skipping for now');
    }

    await page.screenshot({
      path: 'step3-form-filled.png',
      fullPage: true
    });

    // Submit the form
    const submitFormButton = page.locator('button:has-text("Submit Job")');
    if (await submitFormButton.isVisible()) {
      await submitFormButton.click();
      console.log('Step 3: Clicked Submit Job button');

      // Wait for submission to process
      await page.waitForTimeout(5000);

      await page.screenshot({
        path: 'step4-job-submitted.png',
        fullPage: true
      });
    }
  } else {
    console.log('Submit New Content button not found, checking alternative selectors');

    // Try alternative selectors
    const altSubmitButton = page.locator('button', { hasText: 'Submit' });
    const buttonCount = await altSubmitButton.count();
    console.log(`Found ${buttonCount} buttons with "Submit" text`);

    if (buttonCount > 0) {
      await altSubmitButton.first().click();
      console.log('Clicked alternative submit button');
      await page.waitForTimeout(2000);
    }
  }

  // Step 2: Navigate to tech photos page to check for AI report
  console.log('Step 4: Navigating to tech photos page');
  await page.goto('http://localhost:3000/tech/photos');
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: 'step5-tech-photos-page.png',
    fullPage: true
  });

  // Check for job rows
  const tableRows = await page.locator('tbody tr').count();
  console.log(`Found ${tableRows} job rows in tech photos table`);

  if (tableRows > 0) {
    // Click on the first job row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    console.log('Step 5: Clicked on first job row');

    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'step6-job-modal-opened.png',
      fullPage: true
    });

    // Check for AI Job Report section
    const aiReportSection = page.locator('h4:has-text("AI Job Report")');
    const hasAiReport = await aiReportSection.isVisible();

    console.log(`AI Job Report section visible: ${hasAiReport}`);

    if (hasAiReport) {
      console.log('✅ SUCCESS: AI Job Report section found in modal!');

      await page.screenshot({
        path: 'step7-ai-report-success.png',
        fullPage: true
      });

      // Get the AI report content
      const aiReportContent = await page.locator('div:has(h4:has-text("AI Job Report")) + div').textContent();
      console.log('AI Report Content Preview:', aiReportContent?.substring(0, 200) + '...');
    } else {
      console.log('❌ ISSUE: AI Job Report section NOT found in modal');

      // Debug: Check what sections are present
      const sectionHeadings = await page.locator('h3, h4').allTextContents();
      console.log('Available sections in modal:', sectionHeadings);

      // Debug: Check console errors
      const logs = [];
      page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
      await page.waitForTimeout(1000);
      console.log('Console logs:', logs);

      await page.screenshot({
        path: 'step7-ai-report-missing.png',
        fullPage: true
      });
    }
  } else {
    console.log('❌ No job rows found - job submission may have failed');
  }

  // Step 3: Check database directly for AI reports
  console.log('Step 6: Checking for recent job submissions...');

  // Navigate to a page that might show database info
  await page.goto('http://localhost:3000/api/job-submissions');
  await page.waitForTimeout(2000);

  const apiResponse = await page.textContent('body');
  console.log('API Response preview:', apiResponse?.substring(0, 500));

  await page.screenshot({
    path: 'step8-api-response.png',
    fullPage: true
  });

  console.log('Complete AI job report workflow test finished');
});