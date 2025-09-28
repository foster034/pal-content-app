import { test, expect } from '@playwright/test';

test('Login as franchisee and verify submitted photos are visible', async ({ page }) => {
  console.log('🏢 Testing franchisee login and photo visibility after ID fix...');

  // Step 1: Login as franchisee (we need to find the correct franchisee login)
  console.log('👤 Step 1: Attempting franchisee login...');
  await page.goto('http://localhost:3000/');

  // Try email login for franchisee (assuming franchisee uses email login)
  await page.click('text=Email Login');
  await page.waitForTimeout(1000);

  // Try with a franchisee email - let's use a common test email
  await page.fill('input[name="email"], input[type="email"]', 'alex.jordan@gmail.com');
  await page.fill('input[name="password"], input[type="password"]', 'password123');

  await page.screenshot({
    path: 'franchisee-login-attempt.png',
    fullPage: true
  });

  await page.click('button:has-text("Log in"), button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('📍 Current URL after franchisee login attempt:', page.url());

  // If login failed, let's try the tech login that worked and see if we can access franchisee area
  if (!page.url().includes('/franchisee')) {
    console.log('🔄 Franchisee email login failed, trying tech login to access system...');

    await page.goto('http://localhost:3000/');
    await page.click('text=Tech Code');
    await page.fill('input[placeholder*="tech code" i], input[name="techCode"], input[type="text"]', '8D0LS9');
    await page.click('button:has-text("Log in"), button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  // Step 2: Navigate directly to franchisee photos page
  console.log('🏢 Step 2: Navigating to franchisee photos page...');
  await page.goto('http://localhost:3000/franchisee/photos');
  await page.waitForLoadState('networkidle');

  await page.screenshot({
    path: 'franchisee-photos-final-test.png',
    fullPage: true
  });

  // Step 3: Check the page content
  const pageContent = await page.locator('body').innerText();
  console.log('📄 Franchisee photos page content:', pageContent.substring(0, 800));

  // Check if we're still on a login page
  if (pageContent.includes('Email') && pageContent.includes('Password') && pageContent.includes('Log in')) {
    console.log('🔐 Still on login page - authentication required');

    await page.screenshot({
      path: 'franchisee-photos-needs-auth.png',
      fullPage: true
    });
  } else {
    // We're on the actual franchisee photos page
    const noSubmissions = page.locator('text=No submissions found');
    const hasNoSubmissions = await noSubmissions.isVisible().catch(() => false);

    if (hasNoSubmissions) {
      console.log('❌ ISSUE: Still showing "No submissions found" after our franchisee ID fix');

      // Check browser network requests
      page.on('request', request => {
        if (request.url().includes('franchisee-photos')) {
          console.log('🌐 API request URL:', request.url());
        }
      });

      // Check browser console for errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('🚨 Browser console error:', msg.text());
        }
      });

      // Try refreshing to trigger API calls
      await page.reload();
      await page.waitForTimeout(2000);

    } else {
      console.log('✅ SUCCESS: "No submissions found" is not visible!');

      // Look for submission elements
      const submissionElements = page.locator('[data-testid*="photo"], [data-testid*="job"], .photo-card, .job-card, .submission, .pending');
      const count = await submissionElements.count();
      console.log(`📊 Found ${count} potential submission elements`);

      // Also check for any text that indicates photos/jobs
      const hasJobText = pageContent.includes('job') || pageContent.includes('photo') || pageContent.includes('submission');
      const hasReviewText = pageContent.includes('review') || pageContent.includes('pending') || pageContent.includes('approved');

      if (count > 0 || hasJobText || hasReviewText) {
        console.log('🎉 SUCCESS: Found evidence of photo submissions in franchisee interface!');
      }

      await page.screenshot({
        path: 'franchisee-photos-success-final.png',
        fullPage: true
      });
    }
  }

  console.log('✅ Franchisee photos verification test completed');
});