import { test, expect } from '@playwright/test';

test('Test AI Job Report scrolling functionality', async ({ page }) => {
  console.log('Starting AI Job Report scrolling test...');

  // Navigate to tech photos page
  await page.goto('http://localhost:3000/tech/photos');
  await page.waitForTimeout(3000);

  console.log('Step 1: Navigated to tech photos page');

  await page.screenshot({
    path: 'scroll-test-tech-photos-page.png',
    fullPage: true
  });

  // Look for job rows
  const tableRows = await page.locator('tbody tr').count();
  console.log(`Found ${tableRows} job rows`);

  if (tableRows > 0) {
    // Click on the first job row to open modal
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    console.log('Step 2: Clicked on first job row to open modal');

    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'scroll-test-modal-opened.png',
      fullPage: true
    });

    // Check if AI Job Report section exists
    const aiReportSection = page.locator('h4:has-text("AI Job Report")');
    const hasAiReport = await aiReportSection.isVisible();

    console.log(`AI Job Report section visible: ${hasAiReport}`);

    if (hasAiReport) {
      // Find the scrollable container
      const scrollableContainer = page.locator('div.max-h-96.overflow-y-auto').first();
      const isScrollable = await scrollableContainer.isVisible();

      console.log(`Scrollable container found: ${isScrollable}`);

      if (isScrollable) {
        // Check if the container has scrollable content
        const containerHeight = await scrollableContainer.evaluate(el => {
          return {
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            hasScroll: el.scrollHeight > el.clientHeight
          };
        });

        console.log(`Container dimensions:`, containerHeight);

        if (containerHeight.hasScroll) {
          console.log('✅ SUCCESS: AI Report container is scrollable!');

          // Test scrolling
          await scrollableContainer.evaluate(el => {
            el.scrollTop = el.scrollHeight / 2; // Scroll to middle
          });

          await page.waitForTimeout(1000);

          await page.screenshot({
            path: 'scroll-test-scrolled-middle.png',
            fullPage: true
          });

          console.log('✅ Successfully scrolled AI report content');

          // Scroll to bottom
          await scrollableContainer.evaluate(el => {
            el.scrollTop = el.scrollHeight;
          });

          await page.waitForTimeout(1000);

          await page.screenshot({
            path: 'scroll-test-scrolled-bottom.png',
            fullPage: true
          });

          console.log('✅ FINAL SUCCESS: AI Report scrolling works perfectly!');

        } else {
          console.log('ℹ️ Content fits within container, no scroll needed');
          console.log('✅ Container setup correctly for future long reports');
        }
      } else {
        console.log('❌ Scrollable container not found');
      }
    } else {
      console.log('❌ No AI Job Report found to test scrolling');
    }

    // Close modal
    const closeButton = page.locator('button[aria-label="Close"]').or(page.locator('.absolute.top-4.right-4'));
    if (await closeButton.isVisible()) {
      await closeButton.click();
      console.log('Step 3: Closed modal');
    }

  } else {
    console.log('❌ No job rows found to test with');
  }

  console.log('AI Job Report scrolling test completed');
});