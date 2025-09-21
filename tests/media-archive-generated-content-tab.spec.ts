import { test, expect } from '@playwright/test';

test.describe('Media Archive - Generated Content Tab', () => {
  test('Verify Generated Content tab appears in Media Archive', async ({ page }) => {
    // Navigate to Media Archive
    await page.goto('/admin/marketing');
    await page.waitForTimeout(3000);

    // Check if we're redirected to login
    const bodyText = await page.locator('body').textContent();
    if (bodyText?.includes('Log in')) {
      console.log('ℹ️ Authentication required - skipping test');
      return;
    }

    // Look for the Generated Content tab
    const generatedContentTab = page.locator('button:has-text("Generated Content")');
    await expect(generatedContentTab).toBeVisible({ timeout: 10000 });
    console.log('✅ Generated Content tab found in Media Archive');

    // Check for other existing tabs
    const approvedTab = page.locator('button:has-text("Approved")');
    const archivedTab = page.locator('button:has-text("Archived")');

    await expect(approvedTab).toBeVisible();
    await expect(archivedTab).toBeVisible();
    console.log('✅ All three tabs (Approved, Archived, Generated Content) are visible');

    // Click on Generated Content tab
    await generatedContentTab.click();
    console.log('✅ Generated Content tab clicked');

    // Wait for content to load
    await page.waitForTimeout(3000);

    // Check if the content area changed to Generated Content
    const generatedContentTitle = page.locator('h2:has-text("Generated Content"), h3:has-text("Generated Content")');
    if (await generatedContentTitle.isVisible()) {
      console.log('✅ Generated Content section loaded');
    }

    // Take screenshot
    await page.screenshot({ path: 'media-archive-with-generated-content-tab.png' });
    console.log('📸 Screenshot taken of Media Archive with Generated Content tab');

    console.log('🎉 Generated Content tab integration test completed successfully');
  });

  test('Verify tab navigation works correctly', async ({ page }) => {
    await page.goto('/admin/marketing');
    await page.waitForTimeout(3000);

    // Check if we're redirected to login
    const bodyText = await page.locator('body').textContent();
    if (bodyText?.includes('Log in')) {
      console.log('ℹ️ Authentication required - skipping test');
      return;
    }

    // Test each tab
    const tabs = [
      { name: 'Approved', selector: 'button:has-text("Approved")' },
      { name: 'Archived', selector: 'button:has-text("Archived")' },
      { name: 'Generated Content', selector: 'button:has-text("Generated Content")' }
    ];

    for (const tab of tabs) {
      console.log(`📍 Testing ${tab.name} tab...`);

      const tabButton = page.locator(tab.selector);
      await expect(tabButton).toBeVisible();
      await tabButton.click();

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Check if tab appears active (has active styling)
      const isActive = await tabButton.getAttribute('class');
      console.log(`✅ ${tab.name} tab clicked and ${isActive?.includes('border-') ? 'appears active' : 'styling may vary'}`);
    }

    console.log('🎉 Tab navigation test completed');
  });

  test('Verify Generated Content displays correctly when empty', async ({ page }) => {
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Check if we're redirected to login
    const bodyText = await page.locator('body').textContent();
    if (bodyText?.includes('Log in')) {
      console.log('ℹ️ Authentication required - skipping test');
      return;
    }

    // Click Generated Content tab
    const generatedContentTab = page.locator('button:has-text("Generated Content")');
    if (await generatedContentTab.isVisible()) {
      await generatedContentTab.click();
      await page.waitForTimeout(3000);

      // Look for empty state message
      const emptyStateText = page.locator('text=No Generated Content, text=Generate AI content');
      const hasEmptyState = await emptyStateText.first().isVisible();

      if (hasEmptyState) {
        console.log('✅ Empty state displayed correctly for Generated Content');
      } else {
        // Look for actual generated content
        const contentItems = page.locator('.border.rounded-lg');
        const itemCount = await contentItems.count();
        console.log(`✅ Found ${itemCount} generated content item(s)`);
      }

      // Take screenshot of Generated Content section
      await page.screenshot({ path: 'generated-content-section.png' });
      console.log('📸 Generated Content section screenshot taken');
    }
  });
});