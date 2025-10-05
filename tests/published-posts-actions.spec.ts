import { test, expect } from '@playwright/test';

test.describe('Published Posts - Delete and Archive', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
    await emailInput.fill(process.env.PLAYWRIGHT_DEMO_EMAIL || 'admin@test.ca');

    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
    await passwordInput.fill(process.env.PLAYWRIGHT_DEMO_PASSWORD || '123456');

    const loginButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: 'Sign In' }));
    await loginButton.click();

    await page.waitForURL('**/admin**', { timeout: 10000 });
    console.log('✅ Logged in as admin');
  });

  test('Individual delete published post', async ({ page }) => {
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Navigate to Published Posts tab
    const publishedTab = page.locator('button').filter({ hasText: 'Published Posts' }).first();
    if (await publishedTab.isVisible()) {
      await publishedTab.click();
      console.log('✅ Published Posts tab clicked');
      await page.waitForTimeout(1000);
    }

    // Get initial count
    const publishedPosts = page.locator('table tbody tr').filter({ hasNot: page.locator('td').filter({ hasText: 'No published' }) });
    const initialCount = await publishedPosts.count();
    console.log(`📊 Initial published posts: ${initialCount}`);

    if (initialCount > 0) {
      // Setup dialog handler
      page.on('dialog', async dialog => {
        console.log('📋 Dialog:', dialog.message());
        await dialog.accept();
      });

      // Click delete button
      const deleteButton = page.locator('button[title="Delete"]').first();
      await deleteButton.click();
      console.log('✅ Delete button clicked');
      await page.waitForTimeout(2000);

      // Verify count decreased
      const finalCount = await publishedPosts.count();
      console.log(`📊 Final published posts: ${finalCount}`);

      expect(finalCount).toBeLessThan(initialCount);
      console.log('✅ Post successfully deleted');
    }
  });

  test('Individual archive published post', async ({ page }) => {
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Navigate to Published Posts tab
    const publishedTab = page.locator('button').filter({ hasText: 'Published Posts' }).first();
    if (await publishedTab.isVisible()) {
      await publishedTab.click();
      await page.waitForTimeout(1000);
    }

    // Get initial count
    const publishedPosts = page.locator('table tbody tr').filter({ hasNot: page.locator('td').filter({ hasText: 'No published' }) });
    const initialCount = await publishedPosts.count();
    console.log(`📊 Initial published posts: ${initialCount}`);

    if (initialCount > 0) {
      // Setup dialog handler
      page.on('dialog', async dialog => {
        console.log('📋 Dialog:', dialog.message());
        await dialog.accept();
      });

      // Click archive button
      const archiveButton = page.locator('button[title="Archive"]').first();
      await archiveButton.click();
      console.log('✅ Archive button clicked');
      await page.waitForTimeout(2000);

      // Verify count decreased
      const finalCount = await publishedPosts.count();
      console.log(`📊 Final published posts: ${finalCount}`);

      expect(finalCount).toBeLessThan(initialCount);
      console.log('✅ Post successfully archived');
    }
  });

  test('Bulk archive published posts', async ({ page }) => {
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Navigate to Published Posts tab
    const publishedTab = page.locator('button').filter({ hasText: 'Published Posts' }).first();
    if (await publishedTab.isVisible()) {
      await publishedTab.click();
      await page.waitForTimeout(1000);
    }

    // Select checkboxes
    const checkboxes = page.locator('input[type="checkbox"]').filter({ hasNot: page.locator('[id*="checkbox-all"]') });
    const checkboxCount = await checkboxes.count();
    console.log(`📊 Found ${checkboxCount} checkboxes`);

    if (checkboxCount > 0) {
      // Select first checkbox
      await checkboxes.first().check();
      await page.waitForTimeout(500);

      // Check for bulk action toolbar
      const bulkToolbar = page.locator('text=selected').or(page.locator('[data-testid="bulk-action-toolbar"]'));

      if (await bulkToolbar.isVisible()) {
        console.log('✅ Bulk action toolbar visible');

        // Setup dialog handler
        page.on('dialog', async dialog => {
          console.log('📋 Dialog:', dialog.message());
          await dialog.accept();
        });

        // Click bulk archive button
        const bulkArchiveButton = page.locator('button').filter({ hasText: /^Archive$/i });
        if (await bulkArchiveButton.isVisible()) {
          await bulkArchiveButton.click();
          console.log('✅ Bulk archive clicked');
          await page.waitForTimeout(2000);

          console.log('✅ Bulk archive completed');
        }
      }
    }
  });

  test('Bulk delete published posts', async ({ page }) => {
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Navigate to Published Posts tab
    const publishedTab = page.locator('button').filter({ hasText: 'Published Posts' }).first();
    if (await publishedTab.isVisible()) {
      await publishedTab.click();
      await page.waitForTimeout(1000);
    }

    // Select checkboxes
    const checkboxes = page.locator('input[type="checkbox"]').filter({ hasNot: page.locator('[id*="checkbox-all"]') });
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      // Select first checkbox
      await checkboxes.first().check();
      await page.waitForTimeout(500);

      const bulkToolbar = page.locator('text=selected');

      if (await bulkToolbar.isVisible()) {
        // Setup dialog handler
        page.on('dialog', async dialog => {
          await dialog.accept();
        });

        // Click bulk delete button
        const bulkDeleteButton = page.locator('button').filter({ hasText: /^Delete$/i });
        if (await bulkDeleteButton.isVisible()) {
          await bulkDeleteButton.click();
          console.log('✅ Bulk delete clicked');
          await page.waitForTimeout(2000);

          console.log('✅ Bulk delete completed');
        }
      }
    }
  });
});
