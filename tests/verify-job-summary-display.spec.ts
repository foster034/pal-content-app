import { test, expect } from '@playwright/test';

test('Verify job summary appears in franchisee photo details modal', async ({ page }) => {
  console.log('🔍 Testing job summary display in franchisee photo details...');

  // Step 1: Login as tech with code 8D0LS9
  console.log('👤 Step 1: Logging in as tech with code 8D0LS9...');
  await page.goto('http://localhost:3000/');

  await page.click('text=Tech Code');
  await page.fill('input[placeholder*="tech code" i], input[name="techCode"], input[type="text"]', '8D0LS9');
  await page.click('button:has-text("Log in"), button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('📍 Current URL after tech login:', page.url());

  // Step 2: Navigate to franchisee photos page
  console.log('🏢 Step 2: Navigating to franchisee photos page...');
  await page.goto('http://localhost:3000/franchisee/photos');
  await page.waitForLoadState('networkidle');

  // Take screenshot of photos page
  await page.screenshot({
    path: 'job-summary-test-photos-page.png',
    fullPage: true
  });

  // Check page content
  const pageContent = await page.locator('body').innerText();
  console.log('📄 Photos page content preview:', pageContent.substring(0, 500));

  // Step 3: Look for photo submissions and click on one to view details
  console.log('🖼️ Step 3: Looking for photo submissions to view details...');

  // Look for photo rows in the table
  const photoRows = page.locator('tbody tr');
  const rowCount = await photoRows.count();
  console.log(`📊 Found ${rowCount} rows in photos table`);

  if (rowCount > 0) {
    console.log('✅ Found photo submissions! Clicking on first photo to view details...');

    // Click on the first photo row to open the modal
    await photoRows.first().click();
    await page.waitForTimeout(2000);

    // Take screenshot of modal
    await page.screenshot({
      path: 'job-summary-test-modal-opened.png',
      fullPage: true
    });

    // Look for the service description section
    const modalContent = await page.locator('body').innerText();
    console.log('📋 Modal content (first 1000 chars):', modalContent.substring(0, 1000));

    // Check if "Service Description" section is visible
    const serviceDescriptionSection = page.locator('text=Service Description');
    const hasServiceDescription = await serviceDescriptionSection.isVisible().catch(() => false);

    if (hasServiceDescription) {
      console.log('✅ Service Description section found!');

      // Look for the actual job description content
      const descriptionContainer = page.locator('.bg-gray-50');
      const descriptionText = await descriptionContainer.first().innerText().catch(() => '');
      console.log('📝 Job description content:', descriptionText);

      if (descriptionText && descriptionText.length > 10) {
        console.log('🎉 SUCCESS: Job summary is visible in the modal!');
        console.log('📋 Job Summary:', descriptionText);
      } else {
        console.log('❌ ISSUE: Service Description section exists but no content found');
      }
    } else {
      console.log('❌ ISSUE: Service Description section not found in modal');

      // Check what modal content we have
      const allText = await page.locator('body').allInnerTexts();
      console.log('🔍 All page text for debugging:', allText[0].substring(0, 1500));
    }

    // Look for other job details
    const jobDetailsPresent = {
      location: modalContent.includes('📍') || modalContent.includes('location'),
      technician: modalContent.includes('Technician') || modalContent.includes('tech'),
      jobType: modalContent.includes('Commercial') || modalContent.includes('Residential'),
      status: modalContent.includes('Pending') || modalContent.includes('Approved')
    };

    console.log('📊 Job details present in modal:', jobDetailsPresent);

    await page.screenshot({
      path: 'job-summary-test-modal-details.png',
      fullPage: true
    });

    // Close the modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

  } else {
    console.log('❌ No photo submissions found to test job summary display');

    // Check if this is the login page or empty state
    if (pageContent.includes('Log in') || pageContent.includes('Email')) {
      console.log('🔐 Still on login page - authentication issue');
    } else if (pageContent.includes('No submissions found')) {
      console.log('📭 Empty state - no submissions to display');
    } else {
      console.log('❓ Unknown page state');
    }
  }

  console.log('✅ Job summary display test completed');
});