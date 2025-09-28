import { test, expect } from '@playwright/test';

test('AI job report functionality test', async ({ page }) => {
  console.log('Starting AI job report test...');

  // Navigate to tech photos page
  await page.goto('http://localhost:3000/tech/photos');

  // Wait for page to load
  await page.waitForTimeout(3000);

  // Take screenshot of tech photos page
  await page.screenshot({
    path: 'ai-job-report-tech-photos-page.png',
    fullPage: true
  });
  console.log('Tech photos page loaded');

  // Click on first job row to open modal
  const firstRow = page.locator('tbody tr').first();
  if (await firstRow.isVisible()) {
    await firstRow.click();
    console.log('Clicked on first job row');

    // Wait for modal to open
    await page.waitForTimeout(2000);

    // Take screenshot of opened modal
    await page.screenshot({
      path: 'ai-job-report-modal-opened.png',
      fullPage: true
    });

    // Check if AI Job Report section exists
    const aiReportSection = page.locator('h4:has-text("AI Job Report")');
    const hasAiReport = await aiReportSection.isVisible();

    console.log(`AI Job Report section visible: ${hasAiReport}`);

    if (hasAiReport) {
      console.log('✅ AI Job Report section found in modal');

      // Take screenshot showing the AI report
      await page.screenshot({
        path: 'ai-job-report-section-visible.png',
        fullPage: true
      });
    } else {
      console.log('❌ AI Job Report section NOT found in modal');

      // Check what data is actually being passed to the modal
      const modalContent = await page.locator('[class*="modal"], [class*="Modal"]').textContent();
      console.log('Modal content:', modalContent);

      // Check console for any errors
      const consoleLogs = [];
      page.on('console', msg => {
        consoleLogs.push(`${msg.type()}: ${msg.text()}`);
      });

      await page.waitForTimeout(1000);
      console.log('Console logs:', consoleLogs);
    }
  } else {
    console.log('❌ No job rows found on tech photos page');

    // Check if there are any jobs in the table
    const tableRows = await page.locator('tbody tr').count();
    console.log(`Number of table rows: ${tableRows}`);

    if (tableRows === 0) {
      console.log('No jobs found - need to submit a job first');

      // Navigate to tech dashboard to submit a job
      await page.goto('http://localhost:3000/tech/dashboard');
      await page.waitForTimeout(2000);

      console.log('Navigated to tech dashboard for job submission');
      await page.screenshot({
        path: 'ai-job-report-tech-dashboard.png',
        fullPage: true
      });
    }
  }

  console.log('AI job report test completed');
});