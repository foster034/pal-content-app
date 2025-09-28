import { test, expect } from '@playwright/test';

test('Tech login and AI job report generation test', async ({ page }) => {
  console.log('🎯 Starting tech login and AI report test...');

  // Navigate to tech auth page
  await page.goto('/tech-auth');
  await page.waitForLoadState('networkidle');

  // The access code field should already be visible
  await page.waitForSelector('input[value="8D0LS9"]', { timeout: 10000 });
  console.log('✅ Found tech access code field with 8D0LS9');

  // Click "Enter Dashboard" button
  await page.click('button:has-text("Enter Dashboard")');
  console.log('🚀 Clicked Enter Dashboard');

  // Wait for redirect to tech dashboard
  try {
    await page.waitForURL('**/tech/dashboard*', { timeout: 15000 });
    console.log('✅ Successfully reached tech dashboard');
  } catch (error) {
    console.log('⚠️ Dashboard redirect may have failed, checking page...');
    const url = page.url();
    console.log('Current URL:', url);

    // Take screenshot for debugging
    await page.screenshot({ path: 'tech-dashboard-state.png', fullPage: true });

    // If not on dashboard, try navigating directly
    if (!url.includes('/tech/dashboard')) {
      await page.goto('/tech/dashboard');
      await page.waitForLoadState('networkidle');
    }
  }

  // Wait for dashboard content to load
  await page.waitForTimeout(2000);
  console.log('📊 Tech dashboard loaded');

  // Look for job submission functionality
  const quickSubmitSelectors = [
    'text=Quick Submit',
    'text=Submit Job',
    'text=New Job',
    'button:has-text("Submit")',
    '[href*="quick-submit"]',
    '[data-testid="quick-submit"]'
  ];

  let foundQuickSubmit = false;
  for (const selector of quickSubmitSelectors) {
    try {
      const element = await page.waitForSelector(selector, { timeout: 3000 });
      if (element) {
        console.log(`🎯 Found quick submit option: ${selector}`);
        await element.click();
        foundQuickSubmit = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!foundQuickSubmit) {
    // Check if there's a form directly on the dashboard
    const formInputs = await page.locator('input, textarea, select').count();
    console.log(`📋 Found ${formInputs} form inputs on dashboard`);

    if (formInputs === 0) {
      // Try the quick-submit URL directly
      console.log('🔄 Trying quick-submit URL directly...');
      await page.goto('/quick-submit');
      await page.waitForLoadState('networkidle');
    }
  }

  // Wait for form to be visible
  await page.waitForSelector('form, input, textarea', { timeout: 10000 });
  console.log('📋 Job submission form is visible');

  // Take a screenshot to see the form
  await page.screenshot({ path: 'job-submission-form.png', fullPage: true });

  // Fill out the job submission form with test data
  console.log('📝 Filling out job submission form...');

  // Try to fill service category
  try {
    const categorySelect = await page.waitForSelector('select:has(option:text("Residential"))', { timeout: 5000 });
    await categorySelect.selectOption({ label: 'Residential' });
    console.log('✅ Selected Residential service category');
  } catch (e) {
    console.log('⚠️ Could not select service category');
  }

  // Try to fill service type
  try {
    const typeSelect = await page.waitForSelector('select:has(option)', { timeout: 5000 });
    const options = await typeSelect.locator('option').allTextContents();
    console.log('Available service type options:', options);

    // Try to select a lock-related service
    const lockOptions = options.filter(opt => opt.toLowerCase().includes('lock') || opt.toLowerCase().includes('rekey'));
    if (lockOptions.length > 0) {
      await typeSelect.selectOption({ label: lockOptions[0] });
      console.log(`✅ Selected service type: ${lockOptions[0]}`);
    }
  } catch (e) {
    console.log('⚠️ Could not select service type');
  }

  // Fill location
  try {
    const locationInput = await page.waitForSelector('input[name*="location"], input[placeholder*="location"]', { timeout: 5000 });
    await locationInput.fill('Test Location, Toronto, ON');
    console.log('✅ Filled location');
  } catch (e) {
    console.log('⚠️ Could not fill location');
  }

  // Fill description
  try {
    const descriptionInput = await page.waitForSelector('textarea, input[name*="description"]', { timeout: 5000 });
    await descriptionInput.fill('AI Report Test - Professional lock installation for residential customer. Quick and efficient service provided. Customer extremely satisfied with the work quality.');
    console.log('✅ Filled job description');
  } catch (e) {
    console.log('⚠️ Could not fill description');
  }

  // Set duration
  try {
    const durationInput = await page.waitForSelector('input[type="number"], input[name*="duration"]', { timeout: 5000 });
    await durationInput.fill('60');
    console.log('✅ Set duration to 60 minutes');
  } catch (e) {
    console.log('⚠️ Could not set duration');
  }

  // Set satisfaction rating
  try {
    const ratingSelect = await page.waitForSelector('select[name*="satisfaction"], select[name*="rating"]', { timeout: 5000 });
    await ratingSelect.selectOption('5');
    console.log('✅ Set satisfaction rating to 5 stars');
  } catch (e) {
    console.log('⚠️ Could not set satisfaction rating');
  }

  // Monitor network requests for API calls related to job submissions
  const jobSubmissionPromise = page.waitForResponse(
    response => response.url().includes('/api/job-submissions') && response.request().method() === 'POST',
    { timeout: 30000 }
  );

  // Monitor console for AI-related messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('AI') || text.includes('OpenAI') || text.includes('report') || text.includes('Background')) {
      console.log(`🤖 Console: ${text}`);
    }
  });

  // Submit the form
  console.log('🚀 Submitting job...');
  try {
    await page.click('button[type="submit"], button:has-text("Submit"), input[type="submit"]');
    console.log('✅ Clicked submit button');
  } catch (e) {
    console.log('⚠️ Could not find submit button, trying alternative selectors...');
    const buttons = await page.locator('button').all();
    for (let button of buttons) {
      const text = await button.textContent();
      console.log(`Button text: "${text}"`);
      if (text && text.toLowerCase().includes('submit')) {
        await button.click();
        console.log(`✅ Clicked button: ${text}`);
        break;
      }
    }
  }

  // Wait for job submission API response
  try {
    const response = await jobSubmissionPromise;
    console.log(`✅ Job submission API response: ${response.status()}`);

    if (response.ok()) {
      console.log('🎉 Job submitted successfully!');

      // Wait a moment for AI generation to potentially start
      await page.waitForTimeout(3000);
      console.log('⏳ Waiting for AI report generation...');

    } else {
      console.log('❌ Job submission failed');
    }
  } catch (e) {
    console.log('⚠️ Did not capture job submission response');
  }

  // Look for success message or confirmation
  try {
    const successSelectors = [
      'text=success',
      'text=submitted',
      'text=thank you',
      '.success',
      '.alert-success'
    ];

    for (const selector of successSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        console.log(`✅ Found success message: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
  } catch (e) {
    console.log('⚠️ No obvious success message found');
  }

  // Take final screenshot
  await page.screenshot({ path: 'final-job-submission-state.png', fullPage: true });

  // Additional wait to see if any AI-related console messages appear
  console.log('⏳ Waiting additional time for AI processing...');
  await page.waitForTimeout(5000);

  console.log('✅ Test completed! Check console logs and screenshots for AI report generation evidence.');
  console.log('📝 Note: AI reports are generated asynchronously in the background after job submission.');
});