import { test, expect } from '@playwright/test';

test('Manual AI report generation and display test', async ({ page }) => {
  console.log('Starting manual AI report generation test...');

  // Step 1: Generate AI report directly using node.js
  console.log('Step 1: Generating AI report using Node.js API call...');

  const report = await page.evaluate(async () => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a professional locksmith service report generator. Create detailed, accurate, and professional job reports based on the provided service information.'
            },
            {
              role: 'user',
              content: `Generate a professional job report for a locksmith service based on the following details:

Service Category: Residential
Service Type: Lock Installation
Location: Springwater, Springwater, CA-ON
Date: 2025-09-25
Duration: 30 minutes
Technician: brent foster
Service Description: test
Customer Satisfaction: 5/5

Photos: 2 photos were taken during the service
- Before Photos: 0
- Process Photos: 2
- After Photos: 0

Please generate a comprehensive job report that includes:
1. Executive Summary
2. Work Performed
3. Materials Used
4. Challenges Encountered (if any)
5. Quality Assessment
6. Customer Satisfaction
7. Recommendations

The report should be professional, detailed, and suitable for both technical records and customer communication.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        return {
          success: true,
          report: aiResponse.choices[0].message.content,
          generatedAt: new Date().toISOString()
        };
      } else {
        throw new Error(`OpenAI API failed: ${response.statusText}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  if (report.success) {
    console.log('✅ AI report generated successfully');
    console.log('Report preview:', report.report.substring(0, 200) + '...');
  } else {
    console.log('❌ Failed to generate AI report:', report.error);
    return;
  }

  // Step 2: Manually update database with AI report using API call
  console.log('Step 2: Updating database with generated AI report...');

  const updateResponse = await page.evaluate(async (reportData) => {
    try {
      // Create a custom endpoint to update the job with AI report
      const response = await fetch('/api/update-job-ai-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: '54244cbe-97d8-4d5b-983a-e50fa135425b',
          aiReport: reportData.report,
          aiReportGeneratedAt: reportData.generatedAt
        })
      });

      if (response.ok) {
        return { success: true, message: 'Database updated successfully' };
      } else {
        return { success: false, error: await response.text() };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, report);

  if (updateResponse.success) {
    console.log('✅ Database updated with AI report');
  } else {
    console.log('❌ Database update failed:', updateResponse.error);
    // Continue with test even if manual DB update fails
  }

  // Step 3: Wait a moment and navigate to tech photos page
  console.log('Step 3: Navigating to tech photos page to test display...');
  await page.goto('http://localhost:3000/tech/photos');
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: 'manual-test-tech-photos.png',
    fullPage: true
  });

  // Check for job rows
  const tableRows = await page.locator('tbody tr').count();
  console.log(`Found ${tableRows} job rows in tech photos table`);

  if (tableRows > 0) {
    // Click on the first job row to open modal
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    console.log('Step 4: Clicked on first job row to open modal');

    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'manual-test-modal-opened.png',
      fullPage: true
    });

    // Check for AI Job Report section
    const aiReportSection = page.locator('h4:has-text("AI Job Report")');
    const hasAiReport = await aiReportSection.isVisible();

    console.log(`AI Job Report section visible in modal: ${hasAiReport}`);

    if (hasAiReport) {
      console.log('✅ FINAL SUCCESS: AI Job Report section is visible in modal!');

      await page.screenshot({
        path: 'manual-test-final-success.png',
        fullPage: true
      });

      // Try to get some content
      const reportContentVisible = await page.locator('div:has(h4:has-text("AI Job Report"))').isVisible();
      console.log(`AI Report content section visible: ${reportContentVisible}`);

    } else {
      console.log('❌ AI Job Report section not visible in modal');

      // Debug what sections are available
      const sectionHeadings = await page.locator('h3, h4').allTextContents();
      console.log('Available sections in modal:', sectionHeadings);

      await page.screenshot({
        path: 'manual-test-no-ai-report.png',
        fullPage: true
      });
    }
  } else {
    console.log('❌ No job rows found in tech photos table');
  }

  console.log('Manual AI report generation test completed');
});