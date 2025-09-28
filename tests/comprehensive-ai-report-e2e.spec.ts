import { test, expect } from '@playwright/test';

test.describe('Comprehensive AI Report Generation E2E Test', () => {
  test('Complete workflow: Tech login -> Job submission -> AI report -> Admin verification', async ({ page, context }) => {
    let consoleMessages: string[] = [];
    let networkRequests: string[] = [];
    let networkErrors: string[] = [];

    // Setup console and network monitoring
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

    // STEP 1: Test Tech Login Flow
    console.log('\n=== STEP 1: TESTING TECH LOGIN FLOW ===');
    await page.goto('http://localhost:3000/tech-auth');

    // Take screenshot of login page
    await page.screenshot({ path: 'test1-tech-auth-page.png', fullPage: true });

    // Enter the login code
    await page.fill('input[type="text"]', '8D0LS9');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/tech/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000); // Let page fully load

    // Take screenshot of tech dashboard
    await page.screenshot({ path: 'test1-tech-dashboard-loaded.png', fullPage: true });

    // Verify dashboard elements are present
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check for any console errors during login
    const loginErrors = consoleMessages.filter(msg => msg.includes('ERROR'));
    console.log(`Login console errors: ${loginErrors.length}`);

    // STEP 2: Test Job Submission
    console.log('\n=== STEP 2: TESTING JOB SUBMISSION ===');

    // Look for the "Submit Content" button (top right)
    const submitButton = page.locator('button:has-text("Submit Content")');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Take screenshot of modal
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test2-submit-modal-opened.png', fullPage: true });

    // Fill out the form
    await page.fill('input[placeholder*="job"]', 'Test Job #12345 - AI Report Generation Test');
    await page.fill('textarea[placeholder*="description"]', 'Testing the AI report generation system. This job includes installation of new LED lighting system in customer kitchen area. Work completed successfully with proper electrical connections and safety protocols followed.');
    await page.fill('input[placeholder*="address"]', '123 Test Street, Portland, OR 97201');

    // Upload a test image if file input exists
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      // Create a simple test image file
      await page.evaluate(() => {
        // Create a canvas and convert to blob for testing
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(0, 0, 200, 200);
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.fillText('Test Image', 50, 100);
        }
      });
    }

    // Clear console before submission
    consoleMessages = [];
    networkRequests = [];

    // Submit the form
    const submitFormButton = page.locator('button:has-text("Submit")').last();
    await submitFormButton.click();

    // Wait for submission to complete
    await page.waitForTimeout(5000);

    // Take screenshot after submission
    await page.screenshot({ path: 'test2-after-submission.png', fullPage: true });

    // Check for success message or modal closure
    const isModalClosed = await page.locator('[role="dialog"]').count() === 0;
    console.log(`Modal closed after submission: ${isModalClosed}`);

    // Log network requests during submission
    console.log('\n=== NETWORK REQUESTS DURING SUBMISSION ===');
    networkRequests.forEach(req => console.log(req));

    // Log any errors
    console.log('\n=== NETWORK ERRORS ===');
    networkErrors.forEach(error => console.log(error));

    // STEP 3: Wait for AI processing
    console.log('\n=== STEP 3: WAITING FOR AI PROCESSING ===');
    await page.waitForTimeout(10000); // Wait for AI processing

    // STEP 4: Test Admin View
    console.log('\n=== STEP 4: TESTING ADMIN VIEW ===');

    // Navigate to admin login
    await page.goto('http://localhost:3000/auth/login');

    // Login as admin
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for admin dashboard
    await page.waitForURL('**/admin**', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Navigate to marketing page
    await page.click('a[href="/admin/marketing"]');
    await page.waitForTimeout(2000);

    // Take screenshot of marketing page
    await page.screenshot({ path: 'test4-admin-marketing-page.png', fullPage: true });

    // Look for the submitted job
    const jobRows = page.locator('tr:has-text("Test Job #12345")');
    const jobCount = await jobRows.count();
    console.log(`Found ${jobCount} matching jobs in marketing page`);

    if (jobCount > 0) {
      // Click on the first matching job
      await jobRows.first().click();
      await page.waitForTimeout(1000);

      // Take screenshot of details modal
      await page.screenshot({ path: 'test4-job-details-modal.png', fullPage: true });

      // Check for AI Job Report section
      const aiReportSection = page.locator('text="AI Job Report"');
      const hasAiReport = await aiReportSection.count() > 0;
      console.log(`AI Job Report section present: ${hasAiReport}`);

      if (hasAiReport) {
        // Take screenshot focusing on AI report section
        await page.screenshot({ path: 'test4-ai-report-section.png', fullPage: true });

        // Check for generated content
        const reportContent = await page.locator('div:below(text="AI Job Report")').first().textContent();
        console.log(`AI Report Content Preview: ${reportContent?.substring(0, 200)}...`);
      }
    }

    // STEP 5: Database Verification via API
    console.log('\n=== STEP 5: DATABASE VERIFICATION ===');

    // Make API call to check recent job submissions
    const response = await context.request.get('http://localhost:3000/api/admin/marketing');
    const data = await response.json();

    console.log(`API Response status: ${response.status()}`);

    if (response.ok() && data.jobs) {
      const recentJobs = data.jobs.filter((job: any) =>
        job.job_number?.includes('Test Job #12345') ||
        job.description?.includes('AI Report Generation Test')
      );

      console.log(`Found ${recentJobs.length} matching jobs in database`);

      if (recentJobs.length > 0) {
        const job = recentJobs[0];
        console.log('\n=== JOB DATABASE RECORD ===');
        console.log(`Job ID: ${job.id}`);
        console.log(`Technician ID: ${job.technician_id}`);
        console.log(`AI Report Generated: ${job.ai_report ? 'YES' : 'NO'}`);
        console.log(`AI Report Timestamp: ${job.ai_report_generated_at}`);
        console.log(`AI Report Length: ${job.ai_report ? job.ai_report.length : 'N/A'} characters`);

        if (job.ai_report) {
          console.log(`AI Report Preview: ${job.ai_report.substring(0, 300)}...`);
        }
      }
    }

    // STEP 6: Final Summary
    console.log('\n=== FINAL TEST SUMMARY ===');
    const totalErrors = consoleMessages.filter(msg => msg.includes('ERROR')).length;
    const totalWarnings = consoleMessages.filter(msg => msg.includes('WARN')).length;

    console.log(`Total Console Errors: ${totalErrors}`);
    console.log(`Total Console Warnings: ${totalWarnings}`);
    console.log(`Total Network Requests: ${networkRequests.length}`);
    console.log(`Total Network Errors: ${networkErrors.length}`);

    // Take final screenshot
    await page.screenshot({ path: 'test-final-summary.png', fullPage: true });

    // Save detailed logs
    await page.evaluate((logs) => {
      console.log('=== DETAILED CONSOLE LOGS ===');
      logs.forEach(log => console.log(log));
    }, consoleMessages);
  });
});