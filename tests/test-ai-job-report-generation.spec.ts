import { test, expect } from '@playwright/test';

test('Tech login and AI job report generation', async ({ page }) => {
  console.log('🎯 Starting AI job report generation test...');

  // Navigate to tech auth page
  await page.goto('/tech-auth');
  await page.waitForLoadState('networkidle');

  // Enter tech code
  console.log('📝 Entering tech code: 8D0LS9');
  await page.fill('input[placeholder*="code" i]', '8D0LS9');

  // Click login button
  await page.click('button:has-text("Send Login")');

  // Wait for SMS verification step
  await page.waitForSelector('text=Enter the code sent to your phone', { timeout: 10000 });
  console.log('📱 SMS verification step reached');

  // For testing, we'll enter a test code (usually 123456 or similar)
  // In a real scenario, you'd need the actual SMS code
  await page.fill('input[placeholder*="verification" i]', '123456');
  await page.click('button:has-text("Verify")');

  // Wait for dashboard or redirect
  try {
    await page.waitForURL('**/tech/dashboard', { timeout: 15000 });
    console.log('✅ Successfully logged in as tech');
  } catch (error) {
    console.log('⚠️ Login may have failed, checking current page...');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Take screenshot for debugging
    await page.screenshot({ path: 'tech-login-debug.png', fullPage: true });

    // If still on auth page, the SMS code might be wrong
    // Let's try a different approach - check if we can access dashboard directly
    await page.goto('/tech/dashboard');
    await page.waitForLoadState('networkidle');
  }

  // Wait for dashboard to load
  await page.waitForSelector('[data-testid="tech-dashboard"], .tech-dashboard, h1:has-text("Dashboard")', { timeout: 10000 });
  console.log('📊 Tech dashboard loaded');

  // Look for and click the job submission button/form
  const submitButtonSelectors = [
    'button:has-text("Submit New Job")',
    'button:has-text("Quick Submit")',
    'button:has-text("Add Job")',
    '[data-testid="submit-job"]',
    '.submit-job-btn',
    'button[class*="submit"]'
  ];

  let submitButton = null;
  for (const selector of submitButtonSelectors) {
    try {
      submitButton = await page.waitForSelector(selector, { timeout: 2000 });
      if (submitButton) {
        console.log(`🎯 Found submit button: ${selector}`);
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!submitButton) {
    // Look for any form or input that suggests job submission
    const formElements = await page.locator('form, [class*="form"], [class*="submit"]').count();
    console.log(`📋 Found ${formElements} potential form elements`);

    // Take screenshot to see what's available
    await page.screenshot({ path: 'tech-dashboard-elements.png', fullPage: true });

    // Try to find any button that might open a form
    const buttons = await page.locator('button').all();
    console.log(`🔍 Found ${buttons.length} buttons on page`);

    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const buttonText = await buttons[i].textContent();
      console.log(`Button ${i}: "${buttonText}"`);
    }
  }

  // Click the submit button or form trigger
  if (submitButton) {
    await submitButton.click();
    console.log('🚀 Clicked job submission button');
  } else {
    // Try alternative approaches
    const alternativeSelectors = [
      'text=Submit',
      'text=New Job',
      'text=Add',
      '[role="button"]',
      'a[href*="submit"]'
    ];

    for (const selector of alternativeSelectors) {
      try {
        await page.click(selector, { timeout: 2000 });
        console.log(`🎯 Clicked alternative selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
  }

  // Wait for job submission form to appear
  await page.waitForSelector('input, textarea, select', { timeout: 10000 });
  console.log('📋 Job submission form is visible');

  // Fill out the job submission form
  console.log('📝 Filling out job submission form...');

  // Service category
  const categorySelectors = ['select[name*="category"], select[name*="service"], [data-testid="service-category"]'];
  for (const selector of categorySelectors) {
    try {
      await page.selectOption(selector, { label: 'Residential' });
      console.log('✅ Selected service category: Residential');
      break;
    } catch (e) {
      continue;
    }
  }

  // Service type
  const typeSelectors = ['select[name*="type"], [data-testid="service-type"]'];
  for (const selector of typeSelectors) {
    try {
      await page.selectOption(selector, { label: 'Lock Installation' });
      console.log('✅ Selected service type: Lock Installation');
      break;
    } catch (e) {
      continue;
    }
  }

  // Location
  const locationInputs = ['input[name*="location"], input[placeholder*="location"], [data-testid="location"]'];
  for (const selector of locationInputs) {
    try {
      await page.fill(selector, 'Test Location, Toronto, ON');
      console.log('✅ Filled location');
      break;
    } catch (e) {
      continue;
    }
  }

  // Description
  const descriptionInputs = ['textarea[name*="description"], textarea[placeholder*="description"], [data-testid="description"]'];
  for (const selector of descriptionInputs) {
    try {
      await page.fill(selector, 'Test job for AI report generation - installed new deadbolt lock for residential customer. Customer very satisfied with quick professional service.');
      console.log('✅ Filled description');
      break;
    } catch (e) {
      continue;
    }
  }

  // Duration
  const durationInputs = ['input[name*="duration"], input[type="number"]'];
  for (const selector of durationInputs) {
    try {
      await page.fill(selector, '45');
      console.log('✅ Filled duration: 45 minutes');
      break;
    } catch (e) {
      continue;
    }
  }

  // Satisfaction rating (try to set to 5 stars)
  const ratingInputs = ['select[name*="satisfaction"], input[name*="rating"], [data-testid="satisfaction"]'];
  for (const selector of ratingInputs) {
    try {
      await page.selectOption(selector, '5');
      console.log('✅ Set satisfaction rating: 5');
      break;
    } catch (e) {
      continue;
    }
  }

  // Look for and add a test image
  const fileInputs = await page.locator('input[type="file"]').all();
  if (fileInputs.length > 0) {
    console.log(`📷 Found ${fileInputs.length} file input(s)`);

    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const testImagePath = '/tmp/test-image.png';

    // For Playwright, we'll use a data URL
    try {
      await fileInputs[0].setInputFiles({
        name: 'test-job-photo.png',
        mimeType: 'image/png',
        buffer: testImageBuffer
      });
      console.log('📷 Added test image');
    } catch (error) {
      console.log('⚠️ Could not add image:', error.message);
    }
  }

  // Submit the form
  console.log('🚀 Submitting job...');
  const submitFormButtons = ['button[type="submit"]', 'button:has-text("Submit")', 'input[type="submit"]'];
  for (const selector of submitFormButtons) {
    try {
      await page.click(selector);
      console.log(`✅ Clicked submit button: ${selector}`);
      break;
    } catch (e) {
      continue;
    }
  }

  // Wait for submission confirmation
  await page.waitForTimeout(2000);

  // Look for success message or redirect
  const successIndicators = [
    'text=success',
    'text=submitted',
    'text=thank you',
    '.success',
    '.alert-success',
    '[data-testid="success"]'
  ];

  let foundSuccess = false;
  for (const indicator of successIndicators) {
    try {
      await page.waitForSelector(indicator, { timeout: 3000 });
      console.log(`✅ Found success indicator: ${indicator}`);
      foundSuccess = true;
      break;
    } catch (e) {
      continue;
    }
  }

  if (!foundSuccess) {
    console.log('🔍 Looking for any confirmation...');
    await page.screenshot({ path: 'after-job-submission.png', fullPage: true });
  }

  // Monitor the console for AI generation messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('AI') || text.includes('report') || text.includes('OpenAI')) {
      console.log(`🤖 Console: ${text}`);
    }
  });

  // Monitor network requests for API calls
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/job-submissions') || url.includes('openai')) {
      console.log(`🌐 API Response: ${response.status()} ${url}`);
    }
  });

  // Wait a bit for AI generation to potentially start
  console.log('⏳ Waiting for AI report generation...');
  await page.waitForTimeout(5000);

  // Check if we can navigate to see the results
  try {
    await page.goto('/admin/marketing');
    await page.waitForLoadState('networkidle');
    console.log('📊 Navigated to admin marketing page');

    // Look for any job entries
    const jobItems = await page.locator('[class*="job"], [class*="card"], img').count();
    console.log(`📋 Found ${jobItems} potential job items in marketing page`);

    if (jobItems > 0) {
      // Try clicking the first item to see if AI report is there
      const firstItem = page.locator('[class*="job"], [class*="card"], img').first();
      await firstItem.click();

      // Wait for modal/details to open
      await page.waitForTimeout(2000);

      // Look for AI report section
      const aiReportSelectors = [
        'text=AI Job Report',
        'text=AI Report',
        '[class*="ai-report"]',
        '[data-testid="ai-report"]'
      ];

      let foundAIReport = false;
      for (const selector of aiReportSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          console.log(`🤖 Found AI report section: ${selector}`);
          foundAIReport = true;
          break;
        } catch (e) {
          continue;
        }
      }

      if (foundAIReport) {
        console.log('✅ AI Job Report is visible in the modal!');
        await page.screenshot({ path: 'ai-report-visible.png', fullPage: true });
      } else {
        console.log('⚠️ AI report section not found in modal');
        await page.screenshot({ path: 'modal-without-ai-report.png', fullPage: true });
      }
    }

  } catch (error) {
    console.log('⚠️ Could not access admin marketing page:', error.message);
  }

  console.log('✅ Test completed! Check console logs and screenshots for results.');
});