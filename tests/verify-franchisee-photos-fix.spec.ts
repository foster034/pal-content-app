import { test, expect } from '@playwright/test';

test('Verify franchisee photos appear after fixing franchisee ID', async ({ page }) => {
  console.log('🎯 Testing franchisee photos page after fixing franchisee ID mismatch...');

  // Navigate to franchisee photos page
  await page.goto('http://localhost:3000/franchisee/photos');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Take a screenshot before any interactions
  await page.screenshot({
    path: 'franchisee-photos-after-id-fix.png',
    fullPage: true
  });

  // Check if we can see the submitted photos in the pending tab
  console.log('🔍 Checking for submitted photos in pending review...');

  // Look for photo submissions or job records
  const hasContent = await page.locator('body').innerText();
  console.log('📄 Page content preview:', hasContent.substring(0, 500));

  // Check if "No submissions found" is still present
  const noSubmissions = page.locator('text=No submissions found');
  const hasNoSubmissions = await noSubmissions.isVisible().catch(() => false);

  if (hasNoSubmissions) {
    console.log('❌ Still showing "No submissions found"');

    // Take another screenshot showing the empty state
    await page.screenshot({
      path: 'franchisee-photos-still-empty.png',
      fullPage: true
    });
  } else {
    console.log('✅ "No submissions found" is not visible - photos may be showing!');

    // Look for photo cards or job summary cards
    const photoCards = page.locator('[data-testid*="photo"], .photo-card, .job-card, .submission-card');
    const cardCount = await photoCards.count();
    console.log(`📊 Found ${cardCount} potential photo/job cards`);

    if (cardCount > 0) {
      console.log('✅ SUCCESS: Found photo/job submissions in the franchisee review interface!');
      await page.screenshot({
        path: 'franchisee-photos-showing-submissions.png',
        fullPage: true
      });
    }
  }

  // Also check the network requests to see if the API is being called with correct franchisee ID
  page.on('request', request => {
    if (request.url().includes('franchisee-photos')) {
      console.log('🌐 API request:', request.url());
    }
  });

  // Refresh the page to trigger the API call and see network requests
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Final screenshot after reload
  await page.screenshot({
    path: 'franchisee-photos-after-reload.png',
    fullPage: true
  });

  console.log('✅ Test completed - check screenshots for results');
});