import { test, expect } from '@playwright/test';

test.describe('Manual Job Submission Check', () => {
  test('Submit job and verify database', async ({ page, context }) => {
    console.log('\n=== MANUAL JOB SUBMISSION AND VERIFICATION ===');

    // Login as tech
    await page.goto('http://localhost:3000/tech-auth');
    await page.fill('input[type="text"]', '8D0LS9');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tech/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(3000);

    console.log('\n=== STEP 1: CHECK CURRENT DATABASE STATE ===');

    // First, check current database state via admin API
    const initialResponse = await context.request.get('http://localhost:3000/api/admin/marketing');
    let initialJobs = 0;
    if (initialResponse.ok()) {
      const initialData = await initialResponse.json();
      initialJobs = initialData.jobs ? initialData.jobs.length : 0;
      console.log(`Initial job count: ${initialJobs}`);
    }

    console.log('\n=== STEP 2: SUBMIT A NEW JOB ===');

    // Take screenshot of dashboard
    await page.screenshot({ path: 'manual-test-dashboard.png', fullPage: true });

    // Click Submit Content
    await page.click('button:has-text("Submit Content")');
    await page.waitForTimeout(2000);

    // Take screenshot of modal
    await page.screenshot({ path: 'manual-test-modal.png', fullPage: true });

    // Select category first (required)
    await page.click('select[name="category"], [id*="category"]');
    await page.waitForTimeout(500);

    // Try to find and click a category option
    const categoryOptions = await page.locator('option, [role="option"]').count();
    console.log(`Found ${categoryOptions} category options`);

    if (categoryOptions > 0) {
      // Select the first available category
      await page.locator('option, [role="option"]').first().click();
    }

    // Fill address
    await page.fill('input[placeholder*="Enter job location"], input[name="address"]', '789 Test Drive, AI Test City, OR 97210');

    // Take screenshot of filled form
    await page.screenshot({ path: 'manual-test-form-filled.png', fullPage: true });

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000); // Wait for processing

    // Take screenshot after submission
    await page.screenshot({ path: 'manual-test-after-submit.png', fullPage: true });

    console.log('\n=== STEP 3: VERIFY DATABASE CHANGES ===');

    // Wait a bit more for AI processing
    await page.waitForTimeout(5000);

    // Check database again
    const finalResponse = await context.request.get('http://localhost:3000/api/admin/marketing');
    if (finalResponse.ok()) {
      const finalData = await finalResponse.json();
      const finalJobs = finalData.jobs ? finalData.jobs.length : 0;
      console.log(`Final job count: ${finalJobs}`);
      console.log(`New jobs added: ${finalJobs - initialJobs}`);

      if (finalJobs > initialJobs) {
        // Get the most recent job
        const recentJob = finalData.jobs.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        console.log('\n=== RECENT JOB DETAILS ===');
        console.log(`Job ID: ${recentJob.id}`);
        console.log(`Technician ID: ${recentJob.technician_id}`);
        console.log(`Created: ${recentJob.created_at}`);
        console.log(`Address: ${recentJob.address}`);
        console.log(`AI Report Present: ${recentJob.ai_report ? 'YES' : 'NO'}`);
        console.log(`AI Report Generated At: ${recentJob.ai_report_generated_at || 'Not yet'}`);

        if (recentJob.ai_report) {
          console.log(`AI Report Length: ${recentJob.ai_report.length} characters`);
          console.log(`AI Report Preview:\n${recentJob.ai_report.substring(0, 300)}...`);
        }

        // Verify technician ID matches expected
        const expectedTechId = 'f95f54d7-51be-4f55-a081-2d3b692ff5d9';
        if (recentJob.technician_id === expectedTechId) {
          console.log('✅ Technician ID matches session ID!');
        } else {
          console.log(`❌ Technician ID mismatch. Expected: ${expectedTechId}, Got: ${recentJob.technician_id}`);
        }
      }
    }

    console.log('\n=== STEP 4: TEST ADMIN VIEW ===');

    // Now test admin view
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**', { timeout: 10000 });

    // Go to marketing page
    await page.click('a[href="/admin/marketing"]');
    await page.waitForTimeout(3000);

    // Take screenshot of marketing page
    await page.screenshot({ path: 'manual-test-admin-marketing.png', fullPage: true });

    // Check if we can find the recent job
    const jobRows = await page.locator('tr').count();
    console.log(`Found ${jobRows} rows in marketing table`);

    // Try clicking on the first data row (skip header)
    if (jobRows > 1) {
      await page.locator('tr').nth(1).click();
      await page.waitForTimeout(2000);

      // Take screenshot of modal
      await page.screenshot({ path: 'manual-test-admin-modal.png', fullPage: true });

      // Check for AI Job Report section
      const aiReportExists = await page.locator('text="AI Job Report"').count() > 0;
      console.log(`AI Job Report section visible: ${aiReportExists ? 'YES' : 'NO'}`);

      if (aiReportExists) {
        // Get the report content
        const reportContent = await page.locator('div:below(text="AI Job Report")').first().textContent();
        if (reportContent) {
          console.log(`AI Report Content Preview: ${reportContent.substring(0, 200)}...`);
        }
      }
    }

    console.log('\n=== TEST COMPLETE ===');
  });
});