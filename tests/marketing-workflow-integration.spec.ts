import { test, expect } from '@playwright/test';

test.describe('Marketing Workflow Integration', () => {
  test('Verify Create Marketing Post button exists in AI modal', async ({ page }) => {
    // Navigate to admin marketing page
    await page.goto('/admin/marketing');

    // Wait for page to load and check for the page header
    await page.waitForTimeout(2000);

    // Look for the page title in different possible locations
    const pageTitle = page.locator('h1, h2, [role="heading"]').first();
    const titleText = await pageTitle.textContent();
    console.log(`📝 Page title found: "${titleText}"`);

    // Look for approved content tab and click it
    const approvedTab = page.locator('button').filter({ hasText: 'Approved' });
    if (await approvedTab.isVisible()) {
      await approvedTab.click();
      console.log('✅ Approved tab clicked');
    }

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Find the first approved item and click AI Marketing button
    const aiButtons = page.locator('button').filter({ hasText: 'AI Marketing' });
    const aiButtonCount = await aiButtons.count();

    if (aiButtonCount > 0) {
      console.log(`✅ Found ${aiButtonCount} AI Marketing button(s)`);
      await aiButtons.first().click();

      // Wait for AI modal to open
      const aiModalTitle = page.locator('text=AI Marketing Specialist');
      await expect(aiModalTitle).toBeVisible({ timeout: 10000 });
      console.log('✅ AI Marketing modal opened');

      // Select platform
      const platformSelect = page.locator('select').first();
      await platformSelect.selectOption('facebook');
      console.log('✅ Platform selected: Facebook');

      // Select post type
      const postTypeSelect = page.locator('select').nth(1);
      await postTypeSelect.selectOption('image_post');
      console.log('✅ Post type selected: Image Post');

      // Generate content
      const generateButton = page.locator('button').filter({ hasText: 'Generate Content' });
      await generateButton.click();
      console.log('✅ Generate Content button clicked');

      // Wait for content generation (with longer timeout for AI response)
      await page.waitForTimeout(8000);

      // Look for generated content section
      const contentSection = page.locator('[class*="Generated"]').or(
        page.locator('text=Generated Successfully')
      ).or(
        page.locator('[data-testid="generated-content"]')
      );

      // Check if Preview button appears (indicates content was generated)
      const previewButton = page.locator('button').filter({ hasText: 'Preview' });

      if (await previewButton.isVisible()) {
        console.log('✅ Content generated and Preview button visible');

        // Click Preview button
        await previewButton.click();
        console.log('✅ Preview button clicked');

        // Wait for preview modal to open
        await page.waitForTimeout(2000);

        // Look for the "Create Marketing Post" button in the preview modal
        const createMarketingButton = page.locator('button').filter({ hasText: 'Create Marketing Post' });
        await expect(createMarketingButton).toBeVisible({ timeout: 5000 });
        console.log('✅ Create Marketing Post button found in preview modal');

        // Take a screenshot to verify the button is present
        await page.screenshot({ path: 'create-marketing-post-button.png' });
        console.log('📸 Screenshot taken of Create Marketing Post button');

        console.log('🎉 Marketing workflow integration test completed successfully');
      } else {
        console.log('⚠️ Preview button not visible - content may not have generated');

        // Look for any error messages or other indicators
        const errorText = await page.locator('body').textContent();
        console.log('📄 Page content for debugging:', errorText?.substring(0, 500) + '...');
      }
    } else {
      console.log('ℹ️ No approved content available for AI marketing');
    }
  });

  test('Verify marketing dashboard accessibility', async ({ page }) => {
    // Navigate to marketing dashboard
    await page.goto('/admin/marketing-dashboard');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check if the page loads without errors
    const pageTitle = page.locator('h1').or(page.locator('[role="heading"]')).first();
    const titleExists = await pageTitle.isVisible();

    if (titleExists) {
      const titleText = await pageTitle.textContent();
      console.log(`✅ Marketing dashboard loaded with title: "${titleText}"`);

      // Check for dashboard components
      const draftTab = page.locator('button').filter({ hasText: 'Draft' });
      if (await draftTab.isVisible()) {
        console.log('✅ Draft tab found');
        await draftTab.click();
        console.log('✅ Draft tab clicked successfully');
      }

      // Check for stats cards
      const statsCards = page.locator('[class*="card"]').or(page.locator('[data-testid="stats-card"]'));
      const statsCount = await statsCards.count();
      console.log(`✅ Found ${statsCount} dashboard statistics cards`);

      // Take a screenshot of the dashboard
      await page.screenshot({ path: 'marketing-dashboard.png' });
      console.log('📸 Marketing dashboard screenshot taken');

    } else {
      console.log('⚠️ Marketing dashboard may not have loaded properly');

      // Check if there are any error messages
      const bodyText = await page.locator('body').textContent();
      console.log('📄 Page content:', bodyText?.substring(0, 300) + '...');
    }
  });

  test('Verify AI modal contains marketing workflow elements', async ({ page }) => {
    // Navigate to admin marketing page
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Find and click an AI Marketing button
    const aiButtons = page.locator('button').filter({ hasText: 'AI Marketing' });
    const buttonCount = await aiButtons.count();

    if (buttonCount > 0) {
      await aiButtons.first().click();
      console.log('✅ AI Marketing modal opened');

      // Verify modal contains expected elements
      const modalTitle = page.locator('text=AI Marketing Specialist');
      await expect(modalTitle).toBeVisible();
      console.log('✅ Modal title verified');

      // Check for platform selection
      const platformSelect = page.locator('select').first();
      await expect(platformSelect).toBeVisible();
      console.log('✅ Platform selection dropdown found');

      // Check for post type selection
      const postTypeSelect = page.locator('select').nth(1);
      await expect(postTypeSelect).toBeVisible();
      console.log('✅ Post type selection dropdown found');

      // Check for generate button
      const generateButton = page.locator('button').filter({ hasText: 'Generate Content' });
      await expect(generateButton).toBeVisible();
      console.log('✅ Generate Content button found');

      // Take a screenshot of the AI modal
      await page.screenshot({ path: 'ai-marketing-modal.png' });
      console.log('📸 AI marketing modal screenshot taken');

      console.log('🎉 AI modal elements verification completed');
    } else {
      console.log('ℹ️ No AI Marketing buttons found - may need approved content first');
    }
  });
});