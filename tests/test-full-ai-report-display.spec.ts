import { test, expect } from '@playwright/test';

test('Test full AI report display in franchisee photos modal', async ({ page }) => {
  console.log('Starting full AI report display test...');

  // Navigate to franchisee photos page
  await page.goto('http://localhost:3000/franchisee/photos');
  await page.waitForTimeout(3000);

  console.log('Step 1: Navigated to franchisee photos page');

  await page.screenshot({
    path: 'full-report-test-franchisee-photos.png',
    fullPage: true
  });

  // Check for photo rows
  const tableRows = await page.locator('tbody tr').count();
  console.log(`Found ${tableRows} photo rows`);

  if (tableRows > 0) {
    // Click on the first photo to open modal
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    console.log('Step 2: Clicked on first photo to open modal');

    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'full-report-test-modal-opened.png',
      fullPage: true
    });

    // Check Service Description section
    const serviceDescSection = page.locator('h4:has-text("Service Description")');
    const hasServiceDesc = await serviceDescSection.isVisible();

    console.log(`Service Description section visible: ${hasServiceDesc}`);

    if (hasServiceDesc) {
      // Get the service description content
      const serviceDescContent = await page.locator('div.bg-gray-50 p').textContent();
      console.log(`Service description length: ${serviceDescContent?.length || 0} characters`);

      // Check if it contains full report content (not truncated with "...")
      const isTruncated = serviceDescContent?.endsWith('...');
      const hasFullContent = serviceDescContent && serviceDescContent.length > 500;

      console.log(`Content is truncated: ${isTruncated}`);
      console.log(`Has substantial content: ${hasFullContent}`);

      if (!isTruncated && hasFullContent) {
        console.log('✅ SUCCESS: Full AI report is displaying without truncation!');

        // Check for AI report sections in the content
        const hasExecutiveSummary = serviceDescContent.includes('Executive Summary');
        const hasWorkPerformed = serviceDescContent.includes('Work Performed');
        const hasRecommendations = serviceDescContent.includes('Recommendations');

        console.log(`Contains Executive Summary: ${hasExecutiveSummary}`);
        console.log(`Contains Work Performed: ${hasWorkPerformed}`);
        console.log(`Contains Recommendations: ${hasRecommendations}`);

        if (hasExecutiveSummary && hasWorkPerformed && hasRecommendations) {
          console.log('✅ FINAL SUCCESS: Complete AI report sections are visible!');
        }

      } else {
        console.log('❌ Content appears to still be truncated or too short');
        console.log('Content preview:', serviceDescContent?.substring(0, 200) + '...');
      }

      // Test scrolling in the service description
      const scrollableContainer = page.locator('div.bg-gray-50.rounded-xl.p-4.max-h-96.overflow-y-auto').first();
      const isScrollable = await scrollableContainer.isVisible();

      if (isScrollable) {
        console.log('✅ Service description container is scrollable');

        // Test scrolling
        await scrollableContainer.evaluate(el => {
          el.scrollTop = el.scrollHeight / 2;
        });

        await page.waitForTimeout(1000);

        await page.screenshot({
          path: 'full-report-test-scrolled.png',
          fullPage: true
        });

        console.log('✅ Successfully scrolled through the full report');
      }

    } else {
      console.log('❌ Service Description section not found');
    }

    // Also check for separate AI Job Report section
    const aiReportSection = page.locator('h4:has-text("AI Job Report")');
    const hasAiReport = await aiReportSection.isVisible();

    console.log(`AI Job Report section visible: ${hasAiReport}`);

  } else {
    console.log('❌ No photo rows found to test with');
  }

  console.log('Full AI report display test completed');
});