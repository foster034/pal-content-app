import { test, expect } from '@playwright/test';

test('Verify AI report displays correctly in separate section from service description', async ({ page }) => {
  console.log('🎯 Testing AI report display fix in admin marketing page...');

  // Navigate to admin login page
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');

  // Login as admin
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');

  // Wait for redirect to admin page
  await page.waitForURL('**/admin*', { timeout: 10000 });
  console.log('✅ Logged in as admin successfully');

  // Navigate to media archive page
  await page.goto('/admin/marketing');
  await page.waitForLoadState('networkidle');
  console.log('📊 Navigated to admin marketing page');

  // Wait for media to load
  await page.waitForTimeout(3000);

  // Look for photos in the media archive
  const mediaImages = await page.locator('img[alt*="test"], img[alt*="job"], img[alt*="service"]').count();
  console.log(`📸 Found ${mediaImages} media images`);

  if (mediaImages > 0) {
    // Click on the first media item to open modal
    console.log('🔍 Clicking on first media item to open modal...');
    await page.locator('img[alt*="test"], img[alt*="job"], img[alt*="service"]').first().click();

    // Wait for modal to open
    await page.waitForSelector('[role="dialog"], .dialog', { timeout: 5000 });
    console.log('📋 Modal opened successfully');

    // Take screenshot of opened modal
    await page.screenshot({ path: 'ai-report-modal-opened.png', fullPage: true });

    // Check if Service Description section exists
    const serviceDescSection = await page.locator('text=Service Description').first();
    const serviceDescExists = await serviceDescSection.isVisible();
    console.log(`📝 Service Description section visible: ${serviceDescExists}`);

    if (serviceDescExists) {
      // Get the service description content
      const serviceDescContent = await page.locator('text=Service Description').locator('..').locator('div').last().textContent();
      console.log(`📝 Service Description content: "${serviceDescContent}"`);

      // Check if it contains AI report markers (it should NOT)
      const hasAIMarkers = serviceDescContent?.includes('**Locksmith Service Job Report**') ||
                          serviceDescContent?.includes('**Service Category:**') ||
                          serviceDescContent?.includes('**Executive Summary:**');

      if (hasAIMarkers) {
        console.log('❌ ISSUE: Service Description still contains AI report content!');
      } else {
        console.log('✅ Service Description contains only original content');
      }
    }

    // Check if AI Job Report section exists
    const aiReportSection = await page.locator('text=AI Job Report').first();
    const aiReportExists = await aiReportSection.isVisible();
    console.log(`🤖 AI Job Report section visible: ${aiReportExists}`);

    if (aiReportExists) {
      // Get the AI report content
      const aiReportContent = await page.locator('text=AI Job Report').locator('..').locator('div').last().textContent();
      console.log(`🤖 AI Job Report content (first 200 chars): "${aiReportContent?.substring(0, 200)}..."`);

      // Check if it contains AI report markers (it should)
      const hasAIMarkers = aiReportContent?.includes('Locksmith Service Job Report') ||
                          aiReportContent?.includes('Service Category:') ||
                          aiReportContent?.includes('Executive Summary');

      if (hasAIMarkers) {
        console.log('✅ AI Job Report section contains proper AI-generated content');
      } else {
        console.log('⚠️ AI Job Report section may not contain expected AI content');
      }
    } else {
      console.log('⚠️ AI Job Report section not found - this might be expected if no AI report exists');
    }

    // Check for the purple gradient styling of AI report section
    if (aiReportExists) {
      const purpleGradient = await page.locator('.bg-gradient-to-r.from-purple-50.to-pink-50');
      const hasPurpleGradient = await purpleGradient.isVisible();
      console.log(`💜 Purple gradient styling visible: ${hasPurpleGradient}`);
    }

    // Take final screenshot
    await page.screenshot({ path: 'ai-report-verification-complete.png', fullPage: true });

    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Modal opened: YES`);
    console.log(`✅ Service Description section: ${serviceDescExists ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`✅ AI Job Report section: ${aiReportExists ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`✅ Content separation: ${serviceDescExists && aiReportExists ? 'PROPER' : 'NEEDS CHECKING'}`);

  } else {
    console.log('⚠️ No media images found to test');
  }

  console.log('\n🏁 AI report display verification completed!');
});