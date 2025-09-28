import { test, expect } from '@playwright/test';

test('Test AI report generation fix', async ({ page }) => {
  console.log('Starting AI report generation fix test...');

  // Step 1: Navigate to tech dashboard and submit a job with AI report generation
  await page.goto('http://localhost:3000/tech/dashboard');
  await page.waitForTimeout(3000);

  console.log('Step 1: Navigated to tech dashboard');

  // Look for Submit New Content button
  const submitButton = page.locator('button:has-text("Submit New Content")');

  if (await submitButton.isVisible()) {
    await submitButton.click();
    console.log('Step 2: Clicked Submit New Content button');
    await page.waitForTimeout(2000);

    // Fill out the job submission form
    await page.selectOption('select[name="jobType"]', 'Commercial');
    await page.fill('input[name="location"]', 'AI Report Test Location - Business District');
    await page.fill('textarea[name="description"]', 'Complex lock installation requiring multiple stages: assessment, installation, and testing. This is a test for AI report generation with detailed information.');
    await page.fill('input[name="tags"]', 'AI-report-test, commercial-lock, multi-stage');

    console.log('Step 3: Filled out job form with detailed information');

    await page.screenshot({
      path: 'ai-report-test-form-filled.png',
      fullPage: true
    });

    // Submit the form
    const submitFormButton = page.locator('button:has-text("Submit Job")');
    if (await submitFormButton.isVisible()) {
      await submitFormButton.click();
      console.log('Step 4: Submitted job form');

      // Wait longer for AI report generation
      await page.waitForTimeout(10000);

      await page.screenshot({
        path: 'ai-report-test-job-submitted.png',
        fullPage: true
      });
    }
  }

  // Step 2: Check the API directly for the new job with AI report
  console.log('Step 5: Checking API for AI report...');

  const response = await page.goto('http://localhost:3000/api/job-submissions');
  if (response) {
    const content = await response.text();
    console.log('API Response length:', content.length);

    try {
      const jobs = JSON.parse(content);
      console.log('Number of jobs:', jobs.length);

      if (jobs.length > 0) {
        const latestJob = jobs[0]; // Most recent job
        console.log('Latest job ID:', latestJob.id);
        console.log('Has aiReport field:', 'aiReport' in latestJob);
        console.log('Has aiReportGeneratedAt field:', 'aiReportGeneratedAt' in latestJob);

        if (latestJob.aiReport) {
          console.log('✅ SUCCESS: AI report found!');
          console.log('AI Report preview:', latestJob.aiReport.substring(0, 200) + '...');
          console.log('Generated at:', latestJob.aiReportGeneratedAt);
        } else {
          console.log('❌ AI report missing from job submission');
        }
      }
    } catch (e) {
      console.log('Failed to parse API response:', e);
    }
  }

  // Step 3: Navigate to tech photos page and verify AI report shows in modal
  console.log('Step 6: Testing AI report display in tech photos modal...');

  await page.goto('http://localhost:3000/tech/photos');
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: 'ai-report-test-tech-photos.png',
    fullPage: true
  });

  // Check for job rows
  const tableRows = await page.locator('tbody tr').count();
  console.log(`Found ${tableRows} job rows in tech photos table`);

  if (tableRows > 0) {
    // Click on the first job row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    console.log('Step 7: Clicked on first job row to open modal');

    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'ai-report-test-modal-opened.png',
      fullPage: true
    });

    // Check for AI Job Report section
    const aiReportSection = page.locator('h4:has-text("AI Job Report")');
    const hasAiReport = await aiReportSection.isVisible();

    console.log(`AI Job Report section visible in modal: ${hasAiReport}`);

    if (hasAiReport) {
      console.log('✅ FINAL SUCCESS: AI Job Report section visible in modal!');

      // Get some of the AI report content
      const reportContent = await page.locator('div:has(h4:has-text("AI Job Report")) ~ div').textContent();
      if (reportContent) {
        console.log('AI Report content preview:', reportContent.substring(0, 200) + '...');
      }

      await page.screenshot({
        path: 'ai-report-test-final-success.png',
        fullPage: true
      });
    } else {
      console.log('❌ AI Job Report section still not visible in modal');

      // Debug: Check what sections are present
      const sectionHeadings = await page.locator('h3, h4').allTextContents();
      console.log('Available sections in modal:', sectionHeadings);

      await page.screenshot({
        path: 'ai-report-test-modal-failure.png',
        fullPage: true
      });
    }
  } else {
    console.log('❌ No job rows found in tech photos table');
  }

  console.log('AI report generation fix test completed');
});