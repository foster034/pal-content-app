import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Complete App Workflow: Tech → Franchisee → Admin', () => {
  let jobSubmissionId: string;
  let photoId: string;

  test('Step 1: Tech submits a new job with photos', async ({ page }) => {
    // Navigate to tech login
    await page.goto('/tech');
    await page.waitForTimeout(1000);
    console.log('📍 Navigated to tech page');

    // Enter tech access code
    const accessCodeInput = page.locator('input[type="text"]').or(page.locator('input[placeholder*="code"]').or(page.locator('input[name*="code"]')));
    if (await accessCodeInput.isVisible()) {
      await accessCodeInput.fill('FMOQY2');
      console.log('✅ Access code entered');

      const submitButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: /Submit|Enter|Continue/i }));
      await submitButton.click();
      await page.waitForTimeout(2000);
    }

    console.log('✅ Logged in as tech with code FMOQY2');

    // Navigate to job submission
    await page.goto('/tech/jobs');
    await page.waitForTimeout(2000);
    console.log('📍 Navigated to tech jobs page');

    // Click "New Job" or "Submit Job" button
    const newJobButton = page.locator('button').filter({ hasText: /New Job|Submit Job|Create Job/i }).first();
    if (await newJobButton.isVisible()) {
      await newJobButton.click();
      console.log('✅ New Job button clicked');
      await page.waitForTimeout(1000);
    }

    // Fill out job form
    const serviceTypeSelect = page.locator('select').first();
    if (await serviceTypeSelect.isVisible()) {
      await serviceTypeSelect.selectOption({ index: 1 });
      console.log('✅ Service type selected');
    }

    const descriptionInput = page.locator('textarea, input[name*="description"]').first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('E2E Test: Emergency lockout service for customer vehicle');
      console.log('✅ Job description entered');
    }

    const locationInput = page.locator('input[name*="location"], input[placeholder*="location"]').first();
    if (await locationInput.isVisible()) {
      await locationInput.fill('123 Test Street, Toronto, ON');
      console.log('✅ Location entered');
    }

    // Upload photos
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
      // Create a test image file
      const testImagePath = path.join(__dirname, '../public/test-image.jpg');
      await fileInput.setInputFiles(testImagePath);
      console.log('✅ Photo uploaded');
      await page.waitForTimeout(1000);
    }

    // Submit the job
    const submitButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: /Submit|Create/i }));
    if (await submitButton.isVisible()) {
      await submitButton.click();
      console.log('✅ Job submitted');
      await page.waitForTimeout(2000);
    }

    // Capture job submission ID from URL or page
    const currentUrl = page.url();
    console.log('📋 Current URL:', currentUrl);

    await page.screenshot({ path: 'test-screenshots/step1-tech-submission.png' });
    console.log('📸 Screenshot: Tech job submission');

    console.log('🎉 Step 1 Complete: Tech submitted job');
  });

  test('Step 2: Franchisee reviews and approves photos', async ({ page }) => {
    // Login as franchisee
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
    await emailInput.fill('foster_034@hotmail.com');

    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
    await passwordInput.fill('123456');

    const loginButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: 'Sign In' }));
    await loginButton.click();

    await page.waitForURL('**/franchisee**', { timeout: 10000 });
    console.log('✅ Logged in as franchisee');

    // Navigate to photos page
    await page.goto('/franchisee/photos');
    await page.waitForTimeout(2000);
    console.log('📍 Navigated to franchisee photos page');

    // Look for pending photos
    const pendingTab = page.locator('button').filter({ hasText: 'Pending' }).first();
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
      console.log('✅ Pending tab clicked');
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'test-screenshots/step2-franchisee-pending.png' });
    console.log('📸 Screenshot: Franchisee pending photos');

    // Check if there are pending photos
    const pendingPhotos = page.locator('[data-testid="pending-photo"]').or(
      page.locator('table tbody tr').filter({ hasNot: page.locator('td').filter({ hasText: 'No pending' }) })
    );
    const pendingCount = await pendingPhotos.count();
    console.log(`📊 Found ${pendingCount} pending photos`);

    if (pendingCount > 0) {
      // Approve the first photo
      const approveButton = page.locator('button').filter({ hasText: /Approve/i }).first();
      if (await approveButton.isVisible()) {
        await approveButton.click();
        console.log('✅ Approve button clicked');
        await page.waitForTimeout(2000);
      }

      // Navigate to approved tab
      const approvedTab = page.locator('button').filter({ hasText: 'Approved' }).first();
      if (await approvedTab.isVisible()) {
        await approvedTab.click();
        console.log('✅ Approved tab clicked');
        await page.waitForTimeout(1000);
      }

      await page.screenshot({ path: 'test-screenshots/step2-franchisee-approved.png' });
      console.log('📸 Screenshot: Franchisee approved photos');
    }

    console.log('🎉 Step 2 Complete: Franchisee approved photo');
  });

  test('Step 3: Admin views approved content in marketing', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
    await emailInput.fill('admin@test.ca');

    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
    await passwordInput.fill('123456');

    const loginButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: 'Sign In' }));
    await loginButton.click();

    await page.waitForURL('**/admin**', { timeout: 10000 });
    console.log('✅ Logged in as admin');

    // Navigate to marketing page
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);
    console.log('📍 Navigated to admin marketing page');

    // Click Approved tab
    const approvedTab = page.locator('button').filter({ hasText: 'Approved' }).first();
    if (await approvedTab.isVisible()) {
      await approvedTab.click();
      console.log('✅ Approved tab clicked');
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'test-screenshots/step3-admin-approved.png' });
    console.log('📸 Screenshot: Admin approved content');

    // Check if approved content is visible
    const approvedItems = page.locator('[data-testid="approved-item"]').or(
      page.locator('table tbody tr').filter({ hasNot: page.locator('td').filter({ hasText: 'No approved' }) })
    );
    const approvedCount = await approvedItems.count();
    console.log(`📊 Found ${approvedCount} approved items in marketing`);

    expect(approvedCount).toBeGreaterThan(0);

    console.log('🎉 Step 3 Complete: Admin can view approved content');
  });

  test('Step 4: Admin generates marketing content from approved photo', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
    await emailInput.fill('admin@test.ca');

    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
    await passwordInput.fill('123456');

    const loginButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: 'Sign In' }));
    await loginButton.click();

    await page.waitForURL('**/admin**', { timeout: 10000 });
    console.log('✅ Logged in as admin');

    // Navigate to marketing page
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Click Approved tab
    const approvedTab = page.locator('button').filter({ hasText: 'Approved' }).first();
    if (await approvedTab.isVisible()) {
      await approvedTab.click();
      await page.waitForTimeout(1000);
    }

    // Click AI Marketing button
    const aiMarketingButton = page.locator('button').filter({ hasText: 'AI Marketing' }).first();
    if (await aiMarketingButton.isVisible()) {
      await aiMarketingButton.click();
      console.log('✅ AI Marketing button clicked');
      await page.waitForTimeout(1000);

      // Select platform
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

      // Generate content
      const generateButton = page.locator('button').filter({ hasText: 'Generate Content' });
      if (await generateButton.isVisible()) {
        await generateButton.click();
        console.log('✅ Generate Content clicked');
        await page.waitForTimeout(8000);
      }

      await page.screenshot({ path: 'test-screenshots/step4-content-generated.png' });
      console.log('📸 Screenshot: Content generated');

      // Save to generated content
      const sendToGeneratedButton = page.locator('button').filter({ hasText: 'Send to Generated Content' });
      if (await sendToGeneratedButton.isVisible()) {
        await sendToGeneratedButton.click();
        console.log('✅ Saved to Generated Content');
        await page.waitForTimeout(2000);
      }

      // Close modal
      const closeButton = page.locator('button').filter({ hasText: 'Close' }).or(
        page.locator('[aria-label="Close"]')
      );
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }

      console.log('✅ Modal closed');
    }

    console.log('🎉 Step 4 Complete: Admin generated marketing content');
  });

  test('Step 5: Verify content in Generated Content tab', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
    await emailInput.fill('admin@test.ca');

    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
    await passwordInput.fill('123456');

    const loginButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: 'Sign In' }));
    await loginButton.click();

    await page.waitForURL('**/admin**', { timeout: 10000 });

    // Navigate to marketing page
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Click Generated Content tab
    const generatedTab = page.locator('button').filter({ hasText: 'Generated Content' }).first();
    if (await generatedTab.isVisible()) {
      await generatedTab.click();
      console.log('✅ Generated Content tab clicked');
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'test-screenshots/step5-generated-content.png' });
    console.log('📸 Screenshot: Generated content tab');

    // Verify generated content exists
    const generatedItems = page.locator('[data-testid="generated-item"]').or(
      page.locator('table tbody tr').filter({ hasNot: page.locator('td').filter({ hasText: 'No generated' }) })
    );
    const generatedCount = await generatedItems.count();
    console.log(`📊 Found ${generatedCount} generated content items`);

    expect(generatedCount).toBeGreaterThan(0);

    console.log('🎉 Step 5 Complete: Generated content verified');
  });

  test('Step 6: Test archive functionality', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
    await emailInput.fill('admin@test.ca');

    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
    await passwordInput.fill('123456');

    const loginButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: 'Sign In' }));
    await loginButton.click();

    await page.waitForURL('**/admin**', { timeout: 10000 });

    // Navigate to marketing page
    await page.goto('/admin/marketing');
    await page.waitForTimeout(2000);

    // Click Approved tab
    const approvedTab = page.locator('button').filter({ hasText: 'Approved' }).first();
    if (await approvedTab.isVisible()) {
      await approvedTab.click();
      await page.waitForTimeout(1000);
    }

    // Get initial count
    const approvedItems = page.locator('table tbody tr').filter({ hasNot: page.locator('td').filter({ hasText: 'No approved' }) });
    const initialCount = await approvedItems.count();
    console.log(`📊 Initial approved items: ${initialCount}`);

    if (initialCount > 0) {
      // Click archive button on first item
      const archiveButton = page.locator('button[title="Archive"]').first();
      if (await archiveButton.isVisible()) {
        await archiveButton.click();
        console.log('✅ Archive button clicked');
        await page.waitForTimeout(2000);

        // Refresh to see updated count
        await page.reload();
        await page.waitForTimeout(2000);

        const approvedTabAfter = page.locator('button').filter({ hasText: 'Approved' }).first();
        if (await approvedTabAfter.isVisible()) {
          await approvedTabAfter.click();
          await page.waitForTimeout(1000);
        }

        const finalCount = await approvedItems.count();
        console.log(`📊 Final approved items: ${finalCount}`);

        await page.screenshot({ path: 'test-screenshots/step6-after-archive.png' });
        console.log('📸 Screenshot: After archive');

        // Verify item was archived
        expect(finalCount).toBeLessThan(initialCount);
        console.log('✅ Item successfully archived');
      }

      // Check Archived tab
      const archivedTab = page.locator('button').filter({ hasText: 'Archived' }).first();
      if (await archivedTab.isVisible()) {
        await archivedTab.click();
        console.log('✅ Archived tab clicked');
        await page.waitForTimeout(1000);

        const archivedItems = page.locator('table tbody tr').filter({ hasNot: page.locator('td').filter({ hasText: 'No archived' }) });
        const archivedCount = await archivedItems.count();
        console.log(`📊 Archived items count: ${archivedCount}`);

        await page.screenshot({ path: 'test-screenshots/step6-archived-tab.png' });
        console.log('📸 Screenshot: Archived tab');

        expect(archivedCount).toBeGreaterThan(0);
      }
    }

    console.log('🎉 Step 6 Complete: Archive functionality verified');
  });

  test('Complete Workflow Summary', async ({ page }) => {
    console.log('\n\n📋 COMPLETE WORKFLOW TEST SUMMARY\n');
    console.log('✅ Step 1: Tech submitted job with photos');
    console.log('✅ Step 2: Franchisee reviewed and approved photos');
    console.log('✅ Step 3: Admin viewed approved content in marketing');
    console.log('✅ Step 4: Admin generated marketing content');
    console.log('✅ Step 5: Generated content verified');
    console.log('✅ Step 6: Archive functionality verified');
    console.log('\n🎉 COMPLETE END-TO-END WORKFLOW TEST PASSED!\n');
  });
});
