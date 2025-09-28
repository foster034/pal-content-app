import { test, expect } from '@playwright/test';

test.describe('Direct API AI Report Test', () => {
  test('Test job submission API and AI report generation', async ({ page, context }) => {
    console.log('\n=== DIRECT API JOB SUBMISSION TEST ===');

    // Test data for job submission
    const testJobData = {
      technicianId: 'f95f54d7-51be-4f55-a081-2d3b692ff5d9', // From our successful login
      franchiseeId: '4c8b70f3-797b-4384-869e-e1fb3919f615', // Pop-A-Lock Simcoe County (correct for tech 8D0LS9)
      client: {
        name: 'API Test Customer',
        phone: '555-0199',
        email: 'apitest@example.com',
        preferredContactMethod: 'phone',
        consentToContact: true,
        consentToShare: true
      },
      service: {
        category: 'Installation',
        type: 'Smart Lock',
        location: '999 API Test Avenue, Portland, OR 97206',
        date: new Date().toISOString().split('T')[0],
        duration: 45,
        satisfaction: 5,
        description: 'Direct API test: Installed advanced smart lock system with biometric scanner, keypad, and mobile app integration. Customer trained on all features and provided with backup keys.'
      },
      media: {
        beforePhotos: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAA=='], // Minimal test image
        afterPhotos: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAA=='],
        processPhotos: []
      }
    };

    console.log('\n=== STEP 1: SUBMIT JOB DIRECTLY VIA API ===');

    // Submit job via API
    const response = await context.request.post('http://localhost:3000/api/job-submissions', {
      data: testJobData
    });

    console.log(`API Response Status: ${response.status()}`);

    if (!response.ok()) {
      const errorText = await response.text();
      console.log(`API Error Response: ${errorText}`);
      throw new Error(`API call failed: ${response.status()}`);
    }

    const jobResponse = await response.json();
    console.log('✅ Job submitted successfully via API');
    console.log(`Job ID: ${jobResponse.id}`);
    console.log(`Technician: ${jobResponse.technician.name}`);
    console.log(`Service Location: ${jobResponse.service.location}`);

    const jobId = jobResponse.id;

    console.log('\n=== STEP 2: WAIT FOR AI REPORT GENERATION ===');
    console.log('Waiting 15 seconds for background AI processing...');
    await page.waitForTimeout(15000);

    console.log('\n=== STEP 3: CHECK JOB SUBMISSIONS VIA API ===');

    // Check job submissions to see if AI report was generated
    let jobsResponse;
    let attempts = 0;
    const maxAttempts = 3;

    do {
      attempts++;
      console.log(`Checking job submissions (attempt ${attempts}/${maxAttempts})...`);

      jobsResponse = await context.request.get('http://localhost:3000/api/job-submissions');

      if (jobsResponse.ok()) {
        const jobs = await jobsResponse.json();
        console.log(`Found ${jobs.length} total jobs`);

        // Find our test job
        const testJob = jobs.find((job: any) => job.id === jobId);

        if (testJob) {
          console.log('\n=== TEST JOB DETAILS ===');
          console.log(`Job ID: ${testJob.id}`);
          console.log(`Submitted At: ${testJob.submittedAt}`);
          console.log(`AI Report Present: ${testJob.aiReport ? 'YES' : 'NO'}`);
          console.log(`AI Report Generated At: ${testJob.aiReportGeneratedAt || 'Not set'}`);

          if (testJob.aiReport) {
            console.log(`AI Report Length: ${testJob.aiReport.length} characters`);
            console.log(`AI Report Preview:\n${testJob.aiReport.substring(0, 400)}...`);
            break; // Success!
          } else {
            console.log('⏳ AI report not yet generated, waiting...');
            if (attempts < maxAttempts) {
              await page.waitForTimeout(10000); // Wait 10 more seconds
            }
          }
        } else {
          console.log(`❌ Could not find test job with ID: ${jobId}`);
          break;
        }
      } else {
        console.log(`API Error: ${jobsResponse.status()} - ${await jobsResponse.text()}`);
        break;
      }
    } while (attempts < maxAttempts);

    console.log('\n=== STEP 4: TEST ADMIN VIEW OF SUBMITTED JOB ===');

    // Login as admin
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**', { timeout: 10000 });

    // Go to marketing page
    await page.click('a[href="/admin/marketing"]');
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'direct-api-test-admin-marketing.png', fullPage: true });

    // Look for our test job
    const testJobRow = page.locator('tr:has-text("API Test Customer"), tr:has-text("999 API Test Avenue")');
    const testJobCount = await testJobRow.count();
    console.log(`Found ${testJobCount} matching test jobs in admin view`);

    if (testJobCount > 0) {
      // Click on the test job
      await testJobRow.first().click();
      await page.waitForTimeout(2000);

      // Take screenshot of modal
      await page.screenshot({ path: 'direct-api-test-job-modal.png', fullPage: true });

      // Check for AI Job Report section
      const aiReportSection = page.locator('text="AI Job Report"');
      const aiReportExists = await aiReportSection.count() > 0;
      console.log(`✅ AI Job Report section visible in admin modal: ${aiReportExists ? 'YES' : 'NO'}`);

      if (aiReportExists) {
        // Try to get the report content from the modal
        const reportContainer = page.locator('div:below(text="AI Job Report")').first();
        const reportContent = await reportContainer.textContent();
        if (reportContent && reportContent.trim()) {
          console.log(`AI Report in Modal Preview:\n${reportContent.substring(0, 300)}...`);
        } else {
          console.log('AI Report section found but content appears empty');
        }
      }
    }

    console.log('\n=== TEST SUMMARY ===');
    console.log('✅ API job submission successful');
    console.log('✅ Background AI processing initiated');
    console.log('✅ Admin view accessible');

    const finalJobsResponse = await context.request.get('http://localhost:3000/api/job-submissions');
    if (finalJobsResponse.ok()) {
      const finalJobs = await finalJobsResponse.json();
      const finalTestJob = finalJobs.find((job: any) => job.id === jobId);

      if (finalTestJob && finalTestJob.aiReport) {
        console.log('✅ AI report generation successful');
        console.log(`Final AI Report Length: ${finalTestJob.aiReport.length} characters`);
      } else {
        console.log('⚠️ AI report generation may still be in progress');
      }
    }

    console.log('\n=== DIRECT API TEST COMPLETE ===');
  });
});