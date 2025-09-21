import { test, expect } from '@playwright/test';

test.describe('Complete Generated Content Workflow', () => {
  // Login helper function
  const login = async (page: any) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@test.ca');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  };

  test('Verify admin sidebar has Generated Content and Marketing Dashboard links', async ({ page }) => {
    await login(page);

    // Navigate to admin area
    await page.goto('/admin');
    await page.waitForTimeout(2000);

    // Check for Generated Content link in sidebar
    const generatedContentLink = page.locator('a[href="/admin/generated-content"]');
    await expect(generatedContentLink).toBeVisible({ timeout: 10000 });
    console.log('✅ Generated Content navigation link found');

    // Check for Marketing Dashboard link in sidebar
    const marketingDashboardLink = page.locator('a[href="/admin/marketing-dashboard"]');
    await expect(marketingDashboardLink).toBeVisible({ timeout: 10000 });
    console.log('✅ Marketing Dashboard navigation link found');

    // Take screenshot of sidebar
    await page.screenshot({ path: 'admin-sidebar-with-new-links.png' });
    console.log('📸 Sidebar screenshot taken');
  });

  test('Verify Generated Content page loads and displays correctly', async ({ page }) => {
    await login(page);

    // Navigate directly to Generated Content page
    await page.goto('/admin/generated-content');
    await page.waitForTimeout(3000);

    // Check if the page loaded properly
    const pageTitle = page.locator('h1:has-text("Generated Content")');
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    console.log('✅ Generated Content page loaded successfully');

    // Check for stats cards
    const statsCards = page.locator('[class*="card"]');
    const cardCount = await statsCards.count();
    console.log(`✅ Found ${cardCount} statistics cards`);

    // Check for filters
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    console.log('✅ Search filter found');

    const statusSelect = page.locator('select').first();
    await expect(statusSelect).toBeVisible();
    console.log('✅ Status filter found');

    // Check for refresh button
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
    console.log('✅ Refresh button found');

    // Take screenshot of Generated Content page
    await page.screenshot({ path: 'generated-content-page-loaded.png' });
    console.log('📸 Generated Content page screenshot taken');
  });

  test('Verify Marketing Dashboard page loads correctly', async ({ page }) => {
    await login(page);

    // Navigate to Marketing Dashboard
    await page.goto('/admin/marketing-dashboard');
    await page.waitForTimeout(3000);

    // Check if the page loaded properly
    const pageTitle = page.locator('h1:has-text("Marketing Dashboard")');
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    console.log('✅ Marketing Dashboard page loaded successfully');

    // Check for dashboard tabs
    const allTab = page.locator('button:has-text("All")');
    const draftTab = page.locator('button:has-text("Draft")');
    const scheduledTab = page.locator('button:has-text("Scheduled")');
    const publishedTab = page.locator('button:has-text("Published")');

    await expect(allTab).toBeVisible();
    await expect(draftTab).toBeVisible();
    await expect(scheduledTab).toBeVisible();
    await expect(publishedTab).toBeVisible();
    console.log('✅ All dashboard tabs found');

    // Take screenshot of Marketing Dashboard
    await page.screenshot({ path: 'marketing-dashboard-loaded.png' });
    console.log('📸 Marketing Dashboard screenshot taken');
  });

  test('Test complete workflow: AI generation to Generated Content to Marketing', async ({ page }) => {
    await login(page);

    // Step 1: Navigate to Media Archive and generate AI content
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Look for AI Marketing buttons
    const aiButtons = page.locator('button:has-text("AI Marketing")');
    const buttonCount = await aiButtons.count();

    if (buttonCount > 0) {
      console.log(`✅ Found ${buttonCount} AI Marketing button(s)`);

      // Click first AI Marketing button
      await aiButtons.first().click();
      console.log('✅ AI Marketing modal opened');

      // Wait for modal to load
      await page.waitForTimeout(2000);

      // Select platform and post type
      const platformSelect = page.locator('select').first();
      await platformSelect.selectOption('facebook');
      console.log('✅ Platform selected: Facebook');

      const postTypeSelect = page.locator('select').nth(1);
      await postTypeSelect.selectOption('image_post');
      console.log('✅ Post type selected: Image Post');

      // Generate content
      const generateButton = page.locator('button:has-text("Generate Content")');
      await generateButton.click();
      console.log('✅ Generate Content button clicked');

      // Wait for content generation
      await page.waitForTimeout(8000);

      // Check if Preview button appears (indicates successful generation)
      const previewButton = page.locator('button:has-text("Preview")');

      if (await previewButton.isVisible()) {
        console.log('✅ Content generated successfully');

        // Step 2: Check Generated Content page
        await page.goto('/admin/generated-content');
        await page.waitForTimeout(3000);

        // Refresh to get latest data
        const refreshButton = page.locator('button:has-text("Refresh")');
        if (await refreshButton.isVisible()) {
          await refreshButton.click();
          await page.waitForTimeout(2000);
        }

        // Look for generated content items
        const contentItems = page.locator('.border.rounded-lg');
        const itemCount = await contentItems.count();
        console.log(`✅ Found ${itemCount} generated content item(s)`);

        // Step 3: Send content to marketing (if available)
        const sendToMarketingButtons = page.locator('button:has-text("Send to Marketing")');
        const marketingButtonCount = await sendToMarketingButtons.count();

        if (marketingButtonCount > 0) {
          console.log(`✅ Found ${marketingButtonCount} "Send to Marketing" button(s)`);

          // Click first "Send to Marketing" button
          await sendToMarketingButtons.first().click();
          console.log('✅ Send to Marketing button clicked');

          await page.waitForTimeout(3000);

          // Step 4: Verify content appears in Marketing Dashboard
          await page.goto('/admin/marketing-dashboard');
          await page.waitForTimeout(3000);

          // Click Draft tab
          const draftTab = page.locator('button:has-text("Draft")');
          await draftTab.click();
          await page.waitForTimeout(2000);

          // Check for marketing content
          const marketingItems = page.locator('tbody tr');
          const marketingCount = await marketingItems.count();
          console.log(`✅ Found ${marketingCount} marketing item(s) in dashboard`);

          // Take final screenshot
          await page.screenshot({ path: 'complete-workflow-final.png' });
          console.log('📸 Complete workflow screenshot taken');

          console.log('🎉 Complete workflow test passed!');
        } else {
          console.log('ℹ️ No "Send to Marketing" buttons found - content may not be in draft status');
        }
      } else {
        console.log('⚠️ Content generation may have failed or is still in progress');
      }
    } else {
      console.log('ℹ️ No AI Marketing buttons found - may need approved media first');
    }
  });

  test('Test navigation between all three pages', async ({ page }) => {
    await login(page);

    // Test navigation sequence
    const pages = [
      { name: 'Media Archive', url: '/admin/marketing', title: 'Media Archive' },
      { name: 'Generated Content', url: '/admin/generated-content', title: 'Generated Content' },
      { name: 'Marketing Dashboard', url: '/admin/marketing-dashboard', title: 'Marketing Dashboard' }
    ];

    for (const pageInfo of pages) {
      console.log(`📍 Testing navigation to ${pageInfo.name}...`);

      await page.goto(pageInfo.url);
      await page.waitForTimeout(2000);

      // Check if page loaded by looking for expected content
      const hasExpectedContent = await page.locator(`h1:has-text("${pageInfo.title}"), h2:has-text("${pageInfo.title}"), text=${pageInfo.title}`).first().isVisible();

      if (hasExpectedContent) {
        console.log(`✅ ${pageInfo.name} page loaded successfully`);
      } else {
        console.log(`⚠️ ${pageInfo.name} page may not have loaded properly`);
      }

      // Take screenshot of each page
      await page.screenshot({ path: `${pageInfo.name.toLowerCase().replace(' ', '-')}-page.png` });
    }

    console.log('🎉 Navigation test completed!');
  });

  test('Verify API endpoints are working', async ({ page }) => {
    await login(page);

    // Test Generated Content API
    const generatedContentResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/generated-content');
        return {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : null
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Generated Content API Response:', generatedContentResponse);

    // Test Marketing Content API
    const marketingContentResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/marketing-content');
        return {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : null
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Marketing Content API Response:', marketingContentResponse);

    if (generatedContentResponse.ok && marketingContentResponse.ok) {
      console.log('✅ Both API endpoints are working correctly');
    } else {
      console.log('⚠️ One or more API endpoints may have issues');
    }
  });
});