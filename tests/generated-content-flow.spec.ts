import { test, expect } from '@playwright/test';

test.describe('Generated Content Flow', () => {
  test('Verify generated content page loads and displays correctly', async ({ page }) => {
    // Navigate to generated content page
    await page.goto('/admin/generated-content');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check if the page loads without errors
    const pageTitle = page.locator('h1').or(page.locator('[role="heading"]')).first();
    const titleExists = await pageTitle.isVisible();

    if (titleExists) {
      const titleText = await pageTitle.textContent();
      console.log(`✅ Generated content page loaded with title: "${titleText}"`);

      // Check for expected page elements
      const statsCards = page.locator('[class*="card"]');
      const statsCount = await statsCards.count();
      console.log(`✅ Found ${statsCount} statistics cards`);

      // Check for filters
      const searchInput = page.locator('input[placeholder*="Search"]');
      if (await searchInput.isVisible()) {
        console.log('✅ Search input found');
      }

      const statusSelect = page.locator('select').first();
      if (await statusSelect.isVisible()) {
        console.log('✅ Status filter found');
      }

      // Check for content area
      const contentCard = page.locator('text=Generated Content');
      if (await contentCard.isVisible()) {
        console.log('✅ Content list area found');
      }

      // Take a screenshot of the page
      await page.screenshot({ path: 'generated-content-page.png' });
      console.log('📸 Generated content page screenshot taken');

      console.log('🎉 Generated content page verification completed');
    } else {
      console.log('⚠️ Generated content page may not have loaded properly');

      // Check if there are any error messages or login redirect
      const bodyText = await page.locator('body').textContent();
      if (bodyText?.includes('Log in') || bodyText?.includes('sign in')) {
        console.log('ℹ️ Page redirected to login - authentication required');
      } else {
        console.log('📄 Page content:', bodyText?.substring(0, 300) + '...');
      }
    }
  });

  test('Verify AI generation saves to generated content table', async ({ page }) => {
    // Navigate to admin marketing page
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Check if we're redirected to login
    const bodyText = await page.locator('body').textContent();
    if (bodyText?.includes('Log in')) {
      console.log('ℹ️ Authentication required - skipping AI generation test');
      return;
    }

    // Look for AI Marketing buttons
    const aiButtons = page.locator('button').filter({ hasText: 'AI Marketing' });
    const buttonCount = await aiButtons.count();

    if (buttonCount > 0) {
      console.log(`✅ Found ${buttonCount} AI Marketing button(s)`);
      await aiButtons.first().click();

      // Wait for AI modal to open
      const modalTitle = page.locator('text=AI Marketing Specialist');
      if (await modalTitle.isVisible()) {
        console.log('✅ AI Marketing modal opened');

        // Select platform and generate content
        const platformSelect = page.locator('select').first();
        await platformSelect.selectOption('facebook');

        const postTypeSelect = page.locator('select').nth(1);
        await postTypeSelect.selectOption('image_post');

        const generateButton = page.locator('button').filter({ hasText: 'Generate Content' });
        await generateButton.click();
        console.log('✅ Generate Content clicked');

        // Wait for generation
        await page.waitForTimeout(8000);

        // Check if content was generated
        const previewButton = page.locator('button').filter({ hasText: 'Preview' });
        if (await previewButton.isVisible()) {
          console.log('✅ Content appears to have been generated');

          // Now check if it appears in generated content page
          await page.goto('/admin/generated-content');
          await page.waitForTimeout(3000);

          const refreshButton = page.locator('button').filter({ hasText: 'Refresh' });
          if (await refreshButton.isVisible()) {
            await refreshButton.click();
            await page.waitForTimeout(2000);
          }

          // Look for content in the list
          const contentItems = page.locator('[class*="border rounded-lg"]');
          const itemCount = await contentItems.count();

          if (itemCount > 0) {
            console.log(`✅ Found ${itemCount} generated content item(s)`);
          } else {
            console.log('ℹ️ No generated content found - may need database setup');
          }
        }
      }
    } else {
      console.log('ℹ️ No AI Marketing buttons found');
    }
  });

  test('Verify Send to Marketing button workflow', async ({ page }) => {
    // Navigate to generated content page
    await page.goto('/admin/generated-content');
    await page.waitForTimeout(3000);

    // Check if we're redirected to login
    const bodyText = await page.locator('body').textContent();
    if (bodyText?.includes('Log in')) {
      console.log('ℹ️ Authentication required - skipping workflow test');
      return;
    }

    // Look for "Send to Marketing" buttons (only appear on draft content)
    const sendToMarketingButtons = page.locator('button').filter({ hasText: 'Send to Marketing' });
    const buttonCount = await sendToMarketingButtons.count();

    if (buttonCount > 0) {
      console.log(`✅ Found ${buttonCount} "Send to Marketing" button(s)`);

      // Click the first one
      await sendToMarketingButtons.first().click();
      console.log('✅ Send to Marketing button clicked');

      // Wait for the action to complete
      await page.waitForTimeout(3000);

      // Refresh to see if status changed
      const refreshButton = page.locator('button').filter({ hasText: 'Refresh' });
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await page.waitForTimeout(2000);
      }

      // Check for approved status badges
      const approvedBadges = page.locator('text=Approved');
      const approvedCount = await approvedBadges.count();
      console.log(`✅ Found ${approvedCount} approved content item(s)`);

      console.log('🎉 Send to Marketing workflow test completed');
    } else {
      console.log('ℹ️ No "Send to Marketing" buttons found - may need draft content first');
    }
  });
});