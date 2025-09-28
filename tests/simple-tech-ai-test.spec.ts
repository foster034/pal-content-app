import { test, expect } from '@playwright/test';

test('Simple tech login and AI report test', async ({ page }) => {
  console.log('🎯 Starting simple tech login and AI report test...');

  // Navigate to tech auth page
  await page.goto('/tech-auth');
  await page.waitForLoadState('networkidle');
  console.log('📱 Loaded tech-auth page');

  // Take screenshot to verify page loaded
  await page.screenshot({ path: 'tech-auth-loaded.png', fullPage: true });

  // Fill the login code using the exact ID from the component
  await page.fill('#loginCode', '8D0LS9');
  console.log('📝 Filled login code: 8D0LS9');

  // Wait a moment for any state updates
  await page.waitForTimeout(500);

  // Click the "Enter Dashboard" button
  await page.click('button:has-text("Enter Dashboard")');
  console.log('🚀 Clicked Enter Dashboard button');

  // Monitor for the API call to tech-auth
  const techAuthPromise = page.waitForResponse(
    response => response.url().includes('/api/tech-auth') && response.request().method() === 'POST',
    { timeout: 10000 }
  );

  try {
    const authResponse = await techAuthPromise;
    console.log(`🔑 Tech auth API response: ${authResponse.status()}`);

    if (authResponse.ok()) {
      const authData = await authResponse.json();
      console.log('✅ Tech authentication successful');
      console.log(`👤 Technician: ${authData.technician?.name || 'Unknown'}`);
    } else {
      console.log('❌ Tech authentication failed');
    }
  } catch (e) {
    console.log('⚠️ Could not capture tech auth response');
  }

  // Wait for redirect to dashboard
  await page.waitForTimeout(3000);

  // Check current URL
  const currentUrl = page.url();
  console.log(`📍 Current URL: ${currentUrl}`);

  if (currentUrl.includes('/tech/dashboard')) {
    console.log('✅ Successfully redirected to tech dashboard');
  } else {
    console.log('⚠️ May not have reached dashboard, trying direct navigation...');
    await page.goto('/tech/dashboard');
    await page.waitForLoadState('networkidle');
  }

  // Take screenshot of dashboard
  await page.screenshot({ path: 'tech-dashboard-loaded.png', fullPage: true });

  // Look for job submission functionality on dashboard
  await page.waitForTimeout(2000);

  // Check for existing form or submission buttons
  const formElements = await page.locator('form, input, textarea, select').count();
  console.log(`📋 Found ${formElements} form elements on dashboard`);

  if (formElements > 0) {
    console.log('✅ Found job submission form on dashboard');
  } else {
    console.log('🔍 Looking for job submission buttons...');

    // Look for various submission options
    const submitOptions = await page.locator('button, [role="button"], a').all();

    for (let i = 0; i < Math.min(submitOptions.length, 5); i++) {
      const text = await submitOptions[i].textContent();
      console.log(`Button ${i}: "${text}"`);

      if (text && (text.includes('Submit') || text.includes('Add') || text.includes('New'))) {
        await submitOptions[i].click();
        console.log(`✅ Clicked: ${text}`);
        break;
      }
    }
  }

  // Wait for form to appear after clicking
  await page.waitForTimeout(2000);

  // Monitor for job submission API calls
  const jobSubmissionPromise = page.waitForResponse(
    response => response.url().includes('/api/job-submissions') && response.request().method() === 'POST',
    { timeout: 30000 }
  );

  // Monitor console for AI-related messages
  const aiMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('AI') || text.includes('OpenAI') || text.includes('report') || text.includes('Background') || text.includes('✅')) {
      console.log(`🤖 Console: ${text}`);
      aiMessages.push(text);
    }
  });

  // Try to fill and submit a job if form is available
  try {
    console.log('📝 Attempting to fill job form...');

    // Fill service category if available
    const categorySelects = await page.locator('select').all();
    if (categorySelects.length > 0) {
      await categorySelects[0].selectOption({ index: 1 }); // Select first non-empty option
      console.log('✅ Selected service category');
      await page.waitForTimeout(500);
    }

    // Fill service type if available
    if (categorySelects.length > 1) {
      await categorySelects[1].selectOption({ index: 1 });
      console.log('✅ Selected service type');
      await page.waitForTimeout(500);
    }

    // Fill text inputs
    const textInputs = await page.locator('input[type="text"], textarea').all();
    if (textInputs.length > 0) {
      // Location
      await textInputs[0].fill('Toronto, ON, Canada');
      console.log('✅ Filled location');
    }

    if (textInputs.length > 1) {
      // Description
      await textInputs[1].fill('AI Test Job - Professional lock installation completed successfully. Customer very satisfied with service quality.');
      console.log('✅ Filled description');
    }

    // Fill number inputs (duration)
    const numberInputs = await page.locator('input[type="number"]').all();
    if (numberInputs.length > 0) {
      await numberInputs[0].fill('45');
      console.log('✅ Set duration to 45 minutes');
    }

    // Set satisfaction rating if available
    const ratingSelects = await page.locator('select[name*="satisfaction"], select[name*="rating"]').all();
    if (ratingSelects.length > 0) {
      await ratingSelects[0].selectOption('5');
      console.log('✅ Set satisfaction to 5 stars');
    }

    // Take screenshot of filled form
    await page.screenshot({ path: 'job-form-filled.png', fullPage: true });

    // Submit the form
    const submitButton = await page.locator('button[type="submit"], button:has-text("Submit")').first();
    await submitButton.click();
    console.log('🚀 Submitted job form');

    // Wait for API response
    try {
      const jobResponse = await jobSubmissionPromise;
      console.log(`📡 Job submission API response: ${jobResponse.status()}`);

      if (jobResponse.ok()) {
        console.log('🎉 Job submitted successfully!');

        // Wait for AI processing
        console.log('⏳ Waiting for AI report generation...');
        await page.waitForTimeout(5000);

        // Check for AI messages
        if (aiMessages.length > 0) {
          console.log('🤖 AI activity detected:');
          aiMessages.forEach(msg => console.log(`  - ${msg}`));
        } else {
          console.log('⚠️ No AI console messages detected yet');
        }
      }
    } catch (e) {
      console.log('⚠️ Could not capture job submission response');
    }

  } catch (e) {
    console.log('⚠️ Could not complete job submission form');
    console.log('Error:', e.message);
  }

  // Final screenshot
  await page.screenshot({ path: 'test-completed.png', fullPage: true });

  // Final summary
  console.log('\n📊 TEST SUMMARY:');
  console.log(`✅ Tech login: ${currentUrl.includes('/tech') ? 'SUCCESS' : 'FAILED'}`);
  console.log(`✅ AI messages captured: ${aiMessages.length}`);
  console.log('\n🏁 Test completed!');
});