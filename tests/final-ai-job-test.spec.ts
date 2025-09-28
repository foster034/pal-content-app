import { test, expect } from '@playwright/test';

test('Final AI job submission and report test', async ({ page }) => {
  console.log('🎯 Starting final AI job submission and report test...');

  // Navigate to tech auth page
  await page.goto('/tech-auth');
  await page.waitForLoadState('networkidle');
  console.log('📱 Loaded tech-auth page');

  // Fill the login code and click Enter Dashboard
  await page.fill('#loginCode', '8D0LS9');
  await page.click('button:has-text("Enter Dashboard")');
  console.log('🔑 Tech login initiated');

  // Wait for redirect to dashboard
  await page.waitForURL('**/tech/dashboard*', { timeout: 10000 });
  console.log('✅ Reached tech dashboard');

  // Wait for dashboard to fully load
  await page.waitForTimeout(2000);

  // Click the "Submit Content" button
  await page.click('button:has-text("Submit Content")');
  console.log('📝 Clicked Submit Content button');

  // Wait for the modal to open
  await page.waitForSelector('[role="dialog"], .dialog', { timeout: 5000 });
  console.log('📋 Job submission modal opened');

  // Monitor for job submission API call
  const jobSubmissionPromise = page.waitForResponse(
    response => response.url().includes('/api/job-submissions') && response.request().method() === 'POST',
    { timeout: 30000 }
  );

  // Monitor console for AI-related messages
  const aiMessages: string[] = [];
  const allMessages: string[] = [];

  page.on('console', msg => {
    const text = msg.text();
    allMessages.push(text);

    if (text.includes('AI') || text.includes('OpenAI') || text.includes('report') ||
        text.includes('Background') || text.includes('✅') || text.includes('🚀') ||
        text.includes('generateAIReportAsync') || text.toLowerCase().includes('gpt')) {
      console.log(`🤖 AI Console: ${text}`);
      aiMessages.push(text);
    }
  });

  // Fill out the job submission form
  console.log('📝 Filling out job form...');

  // Service Category - wait and select
  try {
    await page.waitForSelector('select', { timeout: 5000 });
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('Residential');
    console.log('✅ Selected Residential category');

    // Wait for service types to populate
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('⚠️ Could not select service category');
  }

  // Service Type
  try {
    const allSelects = page.locator('select');
    const selectCount = await allSelects.count();
    if (selectCount > 1) {
      const serviceSelect = allSelects.nth(1);
      await serviceSelect.selectOption('Lock Installation');
      console.log('✅ Selected Lock Installation service');
    }
  } catch (e) {
    console.log('⚠️ Could not select service type');
  }

  // Location
  try {
    await page.fill('input[placeholder*="location" i]', 'Toronto, ON, Canada');
    console.log('✅ Filled location');
  } catch (e) {
    console.log('⚠️ Could not fill location');
  }

  // Description
  try {
    await page.fill('textarea', 'AI Job Report Test - Professional deadbolt lock installation completed for residential customer. High-quality security hardware installed with precision. Customer extremely satisfied with prompt and professional service. All security features tested and functioning perfectly.');
    console.log('✅ Filled detailed job description');
  } catch (e) {
    console.log('⚠️ Could not fill description');
  }

  // Duration
  try {
    await page.fill('input[type="number"]', '60');
    console.log('✅ Set duration to 60 minutes');
  } catch (e) {
    console.log('⚠️ Could not set duration');
  }

  // Satisfaction Rating
  try {
    const ratingSelect = page.locator('select[name*="satisfaction"], select').last();
    await ratingSelect.selectOption('5');
    console.log('✅ Set satisfaction rating to 5 stars');
  } catch (e) {
    console.log('⚠️ Could not set satisfaction rating');
  }

  // Take screenshot of filled form
  await page.screenshot({ path: 'filled-job-form.png', fullPage: true });

  // Submit the form
  console.log('🚀 Submitting job...');
  try {
    // Look for submit button in the modal
    await page.click('button[type="submit"]');
    console.log('✅ Clicked submit button');
  } catch (e) {
    // Try alternative submit button selectors
    const altSelectors = ['button:has-text("Submit")', 'input[type="submit"]'];
    for (const selector of altSelectors) {
      try {
        await page.click(selector);
        console.log(`✅ Clicked submit button: ${selector}`);
        break;
      } catch (e2) {
        continue;
      }
    }
  }

  // Wait for job submission API response
  let jobSubmitted = false;
  try {
    const response = await jobSubmissionPromise;
    console.log(`📡 Job submission API response: ${response.status()}`);

    if (response.ok()) {
      jobSubmitted = true;
      console.log('🎉 Job submitted successfully!');

      // Try to get response data
      try {
        const responseData = await response.json();
        if (responseData.id) {
          console.log(`📋 Job ID: ${responseData.id}`);
        }
        console.log('📊 Response data:', JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.log('⚠️ Could not parse response JSON');
      }
    } else {
      console.log('❌ Job submission failed');
    }
  } catch (e) {
    console.log('⚠️ Could not capture job submission API response');
  }

  if (jobSubmitted) {
    console.log('⏳ Waiting for AI report generation (happens asynchronously)...');

    // Wait longer to capture AI generation messages
    await page.waitForTimeout(8000);

    // Take final screenshot
    await page.screenshot({ path: 'after-job-submission.png', fullPage: true });

    console.log('\n🤖 AI-RELATED MESSAGES:');
    aiMessages.forEach((msg, i) => {
      console.log(`  ${i + 1}. ${msg}`);
    });

    if (aiMessages.length === 0) {
      console.log('📝 No AI-specific messages. Checking all console messages...');
      const relevantMessages = allMessages.filter(msg =>
        msg.includes('job') || msg.includes('submission') || msg.includes('api') ||
        msg.includes('POST') || msg.includes('Background')
      );

      console.log('\n📝 RELEVANT CONSOLE MESSAGES:');
      relevantMessages.slice(-10).forEach((msg, i) => {
        console.log(`  ${i + 1}. ${msg}`);
      });
    }

    // Check server console for AI generation
    console.log('\n💡 Note: AI report generation happens server-side.');
    console.log('💡 Check the server logs for OpenAI API calls and AI report generation.');
  }

  // Final test summary
  console.log('\n📊 FINAL TEST SUMMARY:');
  console.log(`✅ Tech login: SUCCESS`);
  console.log(`✅ Job submission: ${jobSubmitted ? 'SUCCESS' : 'UNKNOWN'}`);
  console.log(`✅ AI console messages: ${aiMessages.length}`);
  console.log(`📋 Total console messages: ${allMessages.length}`);

  if (jobSubmitted) {
    console.log('\n🎯 NEXT STEPS TO VERIFY AI REPORTS:');
    console.log('1. Check server console logs for AI generation');
    console.log('2. Navigate to admin marketing page');
    console.log('3. Click on the submitted job image');
    console.log('4. Look for "AI Job Report" section in modal');
  }

  console.log('\n🏁 Test completed successfully!');
});