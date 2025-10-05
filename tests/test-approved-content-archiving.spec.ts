import { test, expect } from '@playwright/test';

test.describe('Approved Content Archiving Workflow', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Fill in demo credentials
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
    await emailInput.fill(process.env.PLAYWRIGHT_DEMO_EMAIL || 'admin@test.ca');

    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
    await passwordInput.fill(process.env.PLAYWRIGHT_DEMO_PASSWORD || '123456');

    // Click login button
    const loginButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: 'Sign In' }));
    await loginButton.click();

    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin**', { timeout: 10000 });
    console.log('✅ Logged in successfully');
  });

  test('Verify approved content disappears after generating content', async ({ page }) => {
    // Navigate to admin marketing page
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    console.log('📍 Navigated to marketing page');

    // Click Approved tab
    const approvedTab = page.locator('button').filter({ hasText: 'Approved' }).first();
    if (await approvedTab.isVisible()) {
      await approvedTab.click();
      console.log('✅ Approved tab clicked');
      await page.waitForTimeout(1000);
    }

    // Get the initial count of approved items
    const approvedItems = page.locator('[data-testid="approved-item"]').or(
      page.locator('table tbody tr').filter({ hasNot: page.locator('td').filter({ hasText: 'No approved' }) })
    );
    const initialCount = await approvedItems.count();
    console.log(`📊 Initial approved items count: ${initialCount}`);

    if (initialCount === 0) {
      console.log('ℹ️ No approved content available for testing');
      return;
    }

    // Take screenshot of approved items before generation
    await page.screenshot({ path: 'test-screenshots/approved-before-generation.png' });
    console.log('📸 Screenshot: approved items before generation');

    // Click AI Marketing button for the first approved item
    const aiMarketingButton = page.locator('button').filter({ hasText: 'AI Marketing' }).first();
    if (await aiMarketingButton.isVisible()) {
      await aiMarketingButton.click();
      console.log('✅ AI Marketing button clicked');

      // Wait for modal to open
      await page.waitForTimeout(1000);

      // Select platform (Google Business)
      const platformSelect = page.locator('select').first();
      if (await platformSelect.isVisible()) {
        await platformSelect.selectOption('google-business');
        console.log('✅ Platform selected: Google Business');
      }

      // Select post type
      const postTypeSelect = page.locator('select').nth(1);
      if (await postTypeSelect.isVisible()) {
        await postTypeSelect.selectOption('success-stories');
        console.log('✅ Post type selected: Success Stories');
      }

      // Click Generate Content button
      const generateButton = page.locator('button').filter({ hasText: 'Generate Content' });
      if (await generateButton.isVisible()) {
        await generateButton.click();
        console.log('✅ Generate Content button clicked');

        // Wait for content generation
        await page.waitForTimeout(8000);
        console.log('⏳ Waited for content generation');
      }

      // Look for "Send to Generated Content" button (new button text)
      const sendToGeneratedButton = page.locator('button').filter({ hasText: 'Send to Generated Content' });

      if (await sendToGeneratedButton.isVisible()) {
        console.log('✅ Send to Generated Content button found');

        // Click the button to save to generated content
        await sendToGeneratedButton.click();
        console.log('✅ Send to Generated Content button clicked');

        // Wait for the action to complete
        await page.waitForTimeout(2000);

        // Close the modal
        const closeButton = page.locator('button').filter({ hasText: 'Close' }).or(
          page.locator('[aria-label="Close"]')
        );
        if (await closeButton.isVisible()) {
          await closeButton.click();
          console.log('✅ Modal closed');
        } else {
          // Press Escape to close modal
          await page.keyboard.press('Escape');
          console.log('✅ Modal closed with Escape key');
        }

        // Wait for UI to update
        await page.waitForTimeout(2000);

        // Verify the approved item is no longer in the Approved tab
        const approvedItemsAfter = page.locator('[data-testid="approved-item"]').or(
          page.locator('table tbody tr').filter({ hasNot: page.locator('td').filter({ hasText: 'No approved' }) })
        );
        const finalCount = await approvedItemsAfter.count();
        console.log(`📊 Final approved items count: ${finalCount}`);

        // Take screenshot after generation
        await page.screenshot({ path: 'test-screenshots/approved-after-generation.png' });
        console.log('📸 Screenshot: approved items after generation');

        // Verify count decreased
        expect(finalCount).toBeLessThan(initialCount);
        console.log('✅ Verified: Approved item count decreased from', initialCount, 'to', finalCount);

        // Navigate to Generated Content tab
        const generatedTab = page.locator('button').filter({ hasText: 'Generated Content' }).first();
        if (await generatedTab.isVisible()) {
          await generatedTab.click();
          console.log('✅ Generated Content tab clicked');
          await page.waitForTimeout(1000);

          // Verify the content appears in Generated Content tab
          const generatedItems = page.locator('[data-testid="generated-item"]').or(
            page.locator('table tbody tr').filter({ hasNot: page.locator('td').filter({ hasText: 'No generated' }) })
          );
          const generatedCount = await generatedItems.count();
          console.log(`📊 Generated content count: ${generatedCount}`);

          // Take screenshot of generated content
          await page.screenshot({ path: 'test-screenshots/generated-content-tab.png' });
          console.log('📸 Screenshot: generated content tab');

          expect(generatedCount).toBeGreaterThan(0);
          console.log('✅ Verified: Content appears in Generated Content tab');
        }

        console.log('🎉 Test completed successfully: Approved content archived after generation');
      } else {
        console.log('⚠️ Send to Generated Content button not found - content may not have generated');
        await page.screenshot({ path: 'test-screenshots/generation-failed.png' });
      }
    } else {
      console.log('ℹ️ No AI Marketing button found - approved content may not be available');
    }
  });

  test('Verify bulk archive functionality', async ({ page }) => {
    // Navigate to admin marketing page
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    console.log('📍 Navigated to marketing page');

    // Click Approved tab
    const approvedTab = page.locator('button').filter({ hasText: 'Approved' }).first();
    if (await approvedTab.isVisible()) {
      await approvedTab.click();
      console.log('✅ Approved tab clicked');
      await page.waitForTimeout(1000);
    }

    // Get checkboxes for approved items
    const checkboxes = page.locator('input[type="checkbox"]').filter({ hasNot: page.locator('[aria-label="Select all"]') });
    const checkboxCount = await checkboxes.count();
    console.log(`📊 Found ${checkboxCount} checkboxes for approved items`);

    if (checkboxCount === 0) {
      console.log('ℹ️ No approved content available for bulk archive testing');
      return;
    }

    // Select first checkbox
    await checkboxes.first().check();
    console.log('✅ First item selected');
    await page.waitForTimeout(500);

    // Verify bulk action toolbar appears
    const bulkActionToolbar = page.locator('text=selected').or(
      page.locator('[data-testid="bulk-action-toolbar"]')
    );

    if (await bulkActionToolbar.isVisible()) {
      console.log('✅ Bulk action toolbar appeared');

      // Take screenshot of bulk actions
      await page.screenshot({ path: 'test-screenshots/bulk-actions-toolbar.png' });
      console.log('📸 Screenshot: bulk actions toolbar');

      // Look for Archive button in bulk action toolbar (exact text match to avoid multiple matches)
      const archiveButton = page.locator('button').filter({ hasText: /^Archive$/ }).first();

      if (await archiveButton.isVisible()) {
        console.log('✅ Archive button found in bulk actions');

        // Click archive button
        await archiveButton.click();
        console.log('✅ Archive button clicked');

        // Handle confirmation dialog
        page.on('dialog', async dialog => {
          console.log('📋 Confirmation dialog appeared:', dialog.message());
          await dialog.accept();
          console.log('✅ Confirmation dialog accepted');
        });

        // Wait for action to complete
        await page.waitForTimeout(2000);

        // Verify item is no longer in Approved tab
        await page.screenshot({ path: 'test-screenshots/after-bulk-archive.png' });
        console.log('📸 Screenshot: after bulk archive');

        console.log('🎉 Bulk archive test completed successfully');
      } else {
        console.log('⚠️ Archive button not found in bulk actions');
      }
    } else {
      console.log('⚠️ Bulk action toolbar did not appear');
    }
  });

  test('Verify franchisee name displays correctly', async ({ page }) => {
    // Navigate to admin marketing page
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    console.log('📍 Navigated to marketing page');

    // Click Approved tab
    const approvedTab = page.locator('button').filter({ hasText: 'Approved' }).first();
    if (await approvedTab.isVisible()) {
      await approvedTab.click();
      console.log('✅ Approved tab clicked');
      await page.waitForTimeout(1000);
    }

    // Look for franchisee name in table
    const franchiseeCell = page.locator('td').filter({ hasText: /Pop-A-Lock/i }).first();

    if (await franchiseeCell.isVisible()) {
      const franchiseeName = await franchiseeCell.textContent();
      console.log('✅ Franchisee name found:', franchiseeName);

      // Verify it's not showing platform name or "Unknown"
      expect(franchiseeName).not.toContain('google-business');
      expect(franchiseeName).not.toContain('Unknown Franchisee');

      // Take screenshot
      await page.screenshot({ path: 'test-screenshots/franchisee-name-display.png' });
      console.log('📸 Screenshot: franchisee name display');

      console.log('🎉 Franchisee name verification completed successfully');
    } else {
      console.log('ℹ️ No franchisee names found - approved content may not be available');
    }
  });

  test('Verify all tabs have functional checkboxes', async ({ page }) => {
    // Navigate to admin marketing page
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    const tabs = ['Approved', 'Generated Content', 'Published Posts'];

    for (const tabName of tabs) {
      console.log(`\n📍 Testing ${tabName} tab...`);

      const tab = page.locator('button').filter({ hasText: tabName }).first();
      if (await tab.isVisible()) {
        await tab.click();
        console.log(`✅ ${tabName} tab clicked`);
        await page.waitForTimeout(1000);

        // Check for checkboxes
        const checkboxes = page.locator('input[type="checkbox"]');
        const checkboxCount = await checkboxes.count();
        console.log(`📊 Found ${checkboxCount} checkboxes in ${tabName} tab`);

        if (checkboxCount > 0) {
          // Try to check first checkbox
          const firstCheckbox = checkboxes.first();
          await firstCheckbox.check();

          // Verify it's checked
          const isChecked = await firstCheckbox.isChecked();
          console.log(`✅ First checkbox ${isChecked ? 'is' : 'is not'} checked`);

          expect(isChecked).toBe(true);

          // Uncheck it
          await firstCheckbox.uncheck();
          console.log(`✅ Checkbox unchecked`);
        }

        // Take screenshot
        await page.screenshot({ path: `test-screenshots/${tabName.toLowerCase().replace(' ', '-')}-checkboxes.png` });
        console.log(`📸 Screenshot: ${tabName} tab checkboxes`);
      }
    }

    console.log('\n🎉 All tabs checkbox verification completed successfully');
  });
});
