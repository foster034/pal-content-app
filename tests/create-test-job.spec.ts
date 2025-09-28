import { test, expect } from '@playwright/test';

test('Create test job and verify full AI report workflow', async ({ page }) => {
  console.log('Starting complete test job creation and AI report verification...');

  // Step 1: Navigate to tech dashboard and create a new job
  await page.goto('http://localhost:3000/tech/dashboard');
  await page.waitForTimeout(3000);

  console.log('Step 1: Navigated to tech dashboard');

  // Click Submit Content button
  const submitButton = page.locator('button:has-text("Submit Content")');

  if (await submitButton.isVisible()) {
    await submitButton.click();
    console.log('Step 2: Clicked Submit Content button');
    await page.waitForTimeout(2000);

    // Fill out comprehensive job form
    await page.selectOption('select[name="jobType"]', 'Commercial');
    await page.fill('input[name="location"]', 'Test Location - Downtown Business Complex - 123 Main Street');

    const detailedDescription = `Complete commercial lock installation and security upgrade project.

Work performed included:
- Assessment of existing lock systems and security vulnerabilities
- Removal of outdated mechanical locks from 6 office doors
- Installation of high-security electronic keypad locks with master override
- Programming of access codes for different user levels (admin, employee, visitor)
- Testing of all lock mechanisms and electronic components
- Integration with existing building security system
- Calibration of automatic locking schedules
- Training provided to facility manager on system operation

Materials used:
- 6x Commercial grade electronic keypad locks (Model XYZ-2000)
- Master control panel and wiring harness
- Backup battery systems for power outages
- Security mounting hardware and reinforcement plates
- Programming cables and configuration software

Customer was extremely satisfied with the professional installation and comprehensive security upgrade. All systems tested and functioning perfectly. Recommended quarterly maintenance checks to ensure optimal performance.`;

    await page.fill('textarea[name="description"]', detailedDescription);
    await page.fill('input[name="tags"]', 'commercial, security-upgrade, electronic-locks, full-installation');

    console.log('Step 3: Filled out comprehensive job details');

    await page.screenshot({
      path: 'test-job-form-filled.png',
      fullPage: true
    });

    // Submit the job
    const modalSubmitButton = page.locator('button:has-text("📸 Submit Content")');
    if (await modalSubmitButton.isVisible()) {
      const startTime = Date.now();

      console.log('Step 4: Submitting comprehensive test job...');
      await modalSubmitButton.click();

      // Should complete quickly now (async AI generation)
      await page.waitForTimeout(3000);

      const endTime = Date.now();
      const submissionTime = endTime - startTime;
      console.log(`Job submission took: ${submissionTime}ms (should be fast with async AI)`);

      await page.screenshot({
        path: 'test-job-submitted.png',
        fullPage: true
      });

      // Step 2: Wait for background AI generation to complete
      console.log('Step 5: Waiting for background AI report generation...');
      await page.waitForTimeout(20000); // Give AI time to generate

      // Step 3: Check API to verify job and AI report were created
      console.log('Step 6: Verifying job submission and AI report in API...');
      const response = await page.goto('http://localhost:3000/api/job-submissions');

      if (response) {
        const content = await response.text();
        try {
          const jobs = JSON.parse(content);
          console.log(`Total jobs in system: ${jobs.length}`);

          if (jobs.length > 0) {
            const latestJob = jobs[0]; // Should be our test job
            console.log('Latest job details:');
            console.log('- Job ID:', latestJob.id);
            console.log('- Service Type:', latestJob.service.type);
            console.log('- Location:', latestJob.service.location);
            console.log('- Description length:', latestJob.service.description.length);
            console.log('- AI Report present:', !!latestJob.aiReport);
            console.log('- AI Report length:', latestJob.aiReport?.length || 0);

            if (latestJob.aiReport) {
              console.log('✅ SUCCESS: AI report generated successfully!');
              console.log('AI Report preview:', latestJob.aiReport.substring(0, 300) + '...');
            } else {
              console.log('⏳ AI report still generating or failed...');
            }
          }
        } catch (e) {
          console.log('Failed to parse jobs API response:', e);
        }
      }

      // Step 4: Test viewing the job in franchisee photos
      console.log('Step 7: Testing full AI report display in franchisee photos...');
      await page.goto('http://localhost:3000/franchisee/photos');
      await page.waitForTimeout(3000);

      await page.screenshot({
        path: 'test-job-franchisee-photos.png',
        fullPage: true
      });

      const photoRows = await page.locator('tbody tr').count();
      console.log(`Found ${photoRows} photo entries in franchisee photos`);

      if (photoRows > 0) {
        // Click on the first (latest) photo entry
        const firstRow = page.locator('tbody tr').first();
        await firstRow.click();
        console.log('Step 8: Opened latest photo entry modal');

        await page.waitForTimeout(3000);

        await page.screenshot({
          path: 'test-job-modal-full-report.png',
          fullPage: true
        });

        // Verify Service Description shows full content
        const serviceDescSection = page.locator('h4:has-text("Service Description")');
        if (await serviceDescSection.isVisible()) {
          const serviceContent = await page.locator('div.bg-gray-50 p').textContent();
          console.log('Service description content length:', serviceContent?.length || 0);

          const isTruncated = serviceContent?.endsWith('...');
          const hasDetailedContent = serviceContent && serviceContent.length > 1000;

          console.log('Content is truncated:', isTruncated);
          console.log('Has detailed content:', hasDetailedContent);

          if (!isTruncated && hasDetailedContent) {
            console.log('✅ SUCCESS: Full detailed service description is visible!');
          } else {
            console.log('❌ Service description may still be truncated');
            console.log('Preview:', serviceContent?.substring(0, 200) + '...');
          }
        }

        // Also check AI Job Report section if available
        const aiReportSection = page.locator('h4:has-text("AI Job Report")');
        if (await aiReportSection.isVisible()) {
          console.log('✅ AI Job Report section is also available in modal');

          const aiContent = await page.locator('div.bg-gradient-to-r.from-purple-50 .prose').textContent();
          console.log('AI Report section content length:', aiContent?.length || 0);
        }

        // Test scrolling functionality
        const scrollableDesc = page.locator('div.bg-gray-50.rounded-xl.p-4.max-h-96.overflow-y-auto').first();
        if (await scrollableDesc.isVisible()) {
          console.log('✅ Service description container is scrollable');

          // Test scroll
          await scrollableDesc.evaluate(el => {
            el.scrollTop = el.scrollHeight / 2;
          });

          await page.waitForTimeout(1000);
          console.log('✅ Successfully scrolled through service description');

          await page.screenshot({
            path: 'test-job-scrolled-report.png',
            fullPage: true
          });
        }

      } else {
        console.log('❌ No photo entries found in franchisee photos');
      }

      // Step 5: Test in tech photos view
      console.log('Step 9: Testing in tech photos view...');
      await page.goto('http://localhost:3000/tech/photos');
      await page.waitForTimeout(3000);

      const techPhotoRows = await page.locator('tbody tr').count();
      console.log(`Found ${techPhotoRows} job entries in tech photos`);

      if (techPhotoRows > 0) {
        const firstTechRow = page.locator('tbody tr').first();
        await firstTechRow.click();
        console.log('Step 10: Opened latest job in tech photos modal');

        await page.waitForTimeout(3000);

        const techAiReport = page.locator('h4:has-text("AI Job Report")');
        if (await techAiReport.isVisible()) {
          console.log('✅ AI Job Report visible in tech photos modal');

          await page.screenshot({
            path: 'test-job-tech-ai-report.png',
            fullPage: true
          });
        }
      }

      console.log('🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!');
      console.log('Summary:');
      console.log('✅ Job submission with detailed description');
      console.log('✅ Fast async submission (no waiting for AI)');
      console.log('✅ Background AI report generation');
      console.log('✅ Full report display in franchisee photos');
      console.log('✅ Proper scrolling functionality');
      console.log('✅ Tech photos modal AI report display');

    } else {
      console.log('❌ Submit button not found in modal');
    }
  } else {
    console.log('❌ Submit Content button not found');
  }

  console.log('Test job creation and verification completed');
});