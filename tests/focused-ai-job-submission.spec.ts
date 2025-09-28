import { test, expect } from '@playwright/test';

test.describe('Focused AI Job Submission Test', () => {
  test('Tech job submission with AI report generation', async ({ page, context }) => {
    let consoleMessages: string[] = [];
    let networkRequests: string[] = [];
    let networkErrors: string[] = [];

    // Setup monitoring
    page.on('console', msg => {
      const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
      consoleMessages.push(text);
      console.log(text);
    });

    page.on('request', request => {
      networkRequests.push(`${request.method()} ${request.url()}`);
    });

    page.on('requestfailed', request => {
      const error = `FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`;
      networkErrors.push(error);
      console.log(error);
    });

    // Login as tech
    console.log('\n=== LOGGING IN AS TECH ===');
    await page.goto('http://localhost:3000/tech-auth');
    await page.fill('input[type="text"]', '8D0LS9');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tech/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Take screenshot of loaded dashboard
    await page.screenshot({ path: 'focused-test-dashboard.png', fullPage: true });

    console.log('\n=== ATTEMPTING JOB SUBMISSION ===');

    // Click Submit Content button
    const submitButton = page.locator('button:has-text("Submit Content")');
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Take screenshot of modal
    await page.screenshot({ path: 'focused-test-modal-opened.png', fullPage: true });

    // Fill the form with comprehensive test data
    console.log('Filling form data...');

    // Job number/title
    const jobInput = page.locator('input[placeholder*="job"], input[placeholder*="Job"], input[name*="job"]').first();
    await jobInput.fill('AI Test Job #99999 - Comprehensive E2E Test');

    // Description
    const descTextarea = page.locator('textarea[placeholder*="description"], textarea[name*="description"]').first();
    await descTextarea.fill('This is a comprehensive test of the AI report generation system. The technician completed installation of advanced smart lock system with biometric access, keypad backup, and mobile app integration. Work included drilling, wiring, calibration, and customer training on all features.');

    // Address
    const addressInput = page.locator('input[placeholder*="address"], input[name*="address"]').first();
    await addressInput.fill('456 AI Test Lane, Portland, OR 97205');

    // Take screenshot before submission
    await page.screenshot({ path: 'focused-test-form-filled.png', fullPage: true });

    // Clear monitoring arrays before submission
    consoleMessages = [];
    networkRequests = [];
    networkErrors = [];

    console.log('Submitting form...');

    // Submit the form
    const submitFormButton = page.locator('button[type="submit"], button:has-text("Submit")').last();
    await submitFormButton.click();

    // Wait for submission processing
    await page.waitForTimeout(8000);

    console.log('\n=== SUBMISSION COMPLETE - ANALYZING RESULTS ===');

    // Take screenshot after submission
    await page.screenshot({ path: 'focused-test-after-submission.png', fullPage: true });

    // Check if modal is closed (success indicator)
    const modalCount = await page.locator('[role="dialog"]').count();
    console.log(`Modals open after submission: ${modalCount}`);

    // Log network activity during submission
    console.log('\n=== NETWORK REQUESTS DURING SUBMISSION ===');
    const relevantRequests = networkRequests.filter(req =>
      req.includes('/api/') &&
      !req.includes('_next') &&
      !req.includes('static')
    );
    relevantRequests.forEach(req => console.log(`  ${req}`));

    // Check for errors
    console.log('\n=== CONSOLE ERRORS ===');
    const errors = consoleMessages.filter(msg => msg.includes('ERROR'));
    errors.forEach(error => console.log(`  ${error}`));

    console.log('\n=== NETWORK ERRORS ===');
    networkErrors.forEach(error => console.log(`  ${error}`));

    // Wait additional time for AI processing
    console.log('\nWaiting for AI processing...');
    await page.waitForTimeout(10000);

    // Check database via API
    console.log('\n=== CHECKING DATABASE VIA API ===');
    try {
      const response = await context.request.get('http://localhost:3000/api/admin/marketing');

      if (response.ok()) {
        const data = await response.json();
        console.log(`API Response Status: ${response.status()}`);

        if (data.jobs && data.jobs.length > 0) {
          // Look for our test job
          const testJobs = data.jobs.filter((job: any) =>
            job.job_number?.includes('AI Test Job #99999') ||
            job.description?.includes('comprehensive test of the AI report generation')
          );

          console.log(`Found ${testJobs.length} matching test jobs`);

          if (testJobs.length > 0) {
            const job = testJobs[0];
            console.log('\n=== JOB RECORD DETAILS ===');
            console.log(`Job ID: ${job.id}`);
            console.log(`Technician ID: ${job.technician_id}`);
            console.log(`Created At: ${job.created_at}`);
            console.log(`AI Report Present: ${job.ai_report ? 'YES' : 'NO'}`);
            console.log(`AI Report Generated At: ${job.ai_report_generated_at || 'Not set'}`);

            if (job.ai_report) {
              console.log(`AI Report Length: ${job.ai_report.length} characters`);
              console.log(`AI Report Preview: ${job.ai_report.substring(0, 200)}...`);
            }
          }
        } else {
          console.log('No jobs returned from API');
        }
      } else {
        console.log(`API Error: ${response.status()} - ${await response.text()}`);
      }
    } catch (error) {
      console.log(`API Request Failed: ${error}`);
    }

    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Total console errors: ${consoleMessages.filter(msg => msg.includes('ERROR')).length}`);
    console.log(`Total network errors: ${networkErrors.length}`);
    console.log(`Modal closed: ${modalCount === 0 ? 'YES' : 'NO'}`);
    console.log(`Relevant API calls: ${relevantRequests.length}`);
  });
});