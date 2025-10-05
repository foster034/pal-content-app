import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness and Touch Optimization Tests', () => {
  // Test mobile viewport sizes
  const mobileViewports = [
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'Samsung Galaxy S21', width: 384, height: 854 },
    { name: 'iPad Mini', width: 768, height: 1024 }
  ];

  test.beforeEach(async ({ page }) => {
    // Enable touch events for mobile testing
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  mobileViewports.forEach(({ name, width, height }) => {
    test(`Mobile UI - ${name} (${width}x${height})`, async ({ page }) => {
      // Set viewport to mobile size
      await page.setViewportSize({ width, height });

      // Navigate to tech login page
      await page.goto('http://localhost:3000/tech/login');
      await page.waitForLoadState('networkidle');

      // Test login form responsiveness
      await test.step('Login form mobile layout', async () => {
        const loginForm = page.locator('form');
        await expect(loginForm).toBeVisible();

        // Check input fields have proper mobile sizing
        const codeInput = page.locator('input[type="text"]');

        await expect(codeInput).toBeVisible();

        // Verify minimum touch target size (44px)
        const codeBox = await codeInput.boundingBox();

        expect(codeBox?.height).toBeGreaterThanOrEqual(44);
      });

      // Test button touch targets
      await test.step('Button touch targets', async () => {
        const loginButton = page.locator('button[type="submit"]');
        await expect(loginButton).toBeVisible();

        const buttonBox = await loginButton.boundingBox();
        expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
        expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
      });

      // Login to access dashboard using tech code
      await page.fill('input[type="text"]', 'FMOQY2');
      await page.click('button[type="submit"]');

      // Wait for dashboard to load
      await page.waitForURL('**/tech/dashboard');
      await page.waitForLoadState('networkidle');

      // Test dashboard mobile layout
      await test.step('Dashboard mobile responsiveness', async () => {
        // Check if submit content button is properly sized
        const submitButton = page.locator('button:has-text("Submit Content")');
        await expect(submitButton).toBeVisible();

        const submitBox = await submitButton.boundingBox();
        expect(submitBox?.height).toBeGreaterThanOrEqual(44);

        // Verify stats cards are responsive
        const statsCards = page.locator('[class*="grid"][class*="gap-6"] > div').first();
        await expect(statsCards).toBeVisible();

        // Check if cards stack properly on mobile
        if (width < 768) {
          // On mobile, cards should stack vertically
          const cardsContainer = page.locator('[class*="grid-cols-1"][class*="md:grid-cols-2"]');
          await expect(cardsContainer).toBeVisible();
        }
      });
    });
  });

  test('Mobile Job Submission Modal Touch Optimization', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate and login
    await page.goto('http://localhost:3000/tech/login');
    await page.fill('input[type="text"]', 'FMOQY2');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/tech/dashboard');
    await page.waitForLoadState('networkidle');

    // Open job submission modal
    await page.click('button:has-text("Submit Content")');

    await test.step('Modal mobile optimization', async () => {
      // Wait for modal to appear
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Check modal has mobile-optimized classes
      await expect(modal).toHaveClass(/photo-modal/);
      await expect(modal).toHaveClass(/mobile-optimized/);

      // Verify modal fits in viewport
      const modalBox = await modal.boundingBox();
      expect(modalBox?.width).toBeLessThanOrEqual(390);
      expect(modalBox?.height).toBeLessThanOrEqual(844);
    });

    await test.step('Form elements touch targets', async () => {
      // Test category dropdown
      const categorySelect = page.locator('select').first();
      await expect(categorySelect).toBeVisible();

      const categoryBox = await categorySelect.boundingBox();
      expect(categoryBox?.height).toBeGreaterThanOrEqual(44);

      // Fill out form to enable photo upload
      await categorySelect.selectOption('Automotive');

      // Wait for service dropdown to be enabled
      const serviceSelect = page.locator('select').nth(1);
      await expect(serviceSelect).toBeEnabled();
      await serviceSelect.selectOption('Key Programming');

      // Test location input
      const locationInput = page.locator('input[placeholder*="location"]');
      await expect(locationInput).toBeVisible();

      const locationBox = await locationInput.boundingBox();
      expect(locationBox?.height).toBeGreaterThanOrEqual(44);

      await locationInput.fill('123 Test Street, Test City, TX');
    });

    await test.step('Photo upload area touch optimization', async () => {
      // Find photo upload area
      const uploadArea = page.locator('button:has-text("Take Photo")');
      await expect(uploadArea).toBeVisible();

      // Verify upload area has proper touch classes
      await expect(uploadArea).toHaveClass(/touch-manipulation/);

      const uploadBox = await uploadArea.boundingBox();
      expect(uploadBox?.height).toBeGreaterThanOrEqual(44);
      expect(uploadBox?.width).toBeGreaterThanOrEqual(120); // Minimum width for mobile
    });

    await test.step('Navigation buttons mobile optimization', async () => {
      // Fill description to enable navigation
      const descriptionTextarea = page.locator('textarea[placeholder*="Describe"]');
      await descriptionTextarea.fill('Test automotive key programming service completed successfully.');

      // Check submit button
      const submitButton = page.locator('button:has-text("Submit Content")');
      await expect(submitButton).toBeVisible();

      // Verify button has mobile optimization classes
      await expect(submitButton).toHaveClass(/touch-manipulation/);
      await expect(submitButton).toHaveClass(/clickable/);

      const submitBox = await submitButton.boundingBox();
      expect(submitBox?.height).toBeGreaterThanOrEqual(44);

      // Check cancel button
      const cancelButton = page.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeVisible();

      const cancelBox = await cancelButton.boundingBox();
      expect(cancelBox?.height).toBeGreaterThanOrEqual(44);
    });

    // Close modal
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('Mobile Franchisee Photos Page Touch Optimization', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to franchisee photos page
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');

    // Login as admin
    await page.fill('input[type="email"]', 'brentfoster.popalock@gmail.com');
    await page.fill('input[type="password"]', 'B69706034');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin');
    await page.waitForLoadState('networkidle');

    // Navigate to franchisee photos
    await page.goto('http://localhost:3000/franchisee/photos');
    await page.waitForLoadState('networkidle');

    await test.step('Photo grid mobile layout', async () => {
      // Check if photo grid exists
      const photoGrid = page.locator('[class*="photo-grid"], [class*="grid"]').first();

      if (await photoGrid.isVisible()) {
        // Verify grid adapts to mobile
        const gridBox = await photoGrid.boundingBox();
        expect(gridBox?.width).toBeLessThanOrEqual(390);

        // Check individual photo cards
        const photoCards = page.locator('[class*="photo-grid"] > div, [class*="grid"] > div').first();

        if (await photoCards.isVisible()) {
          const cardBox = await photoCards.boundingBox();
          expect(cardBox?.width).toBeLessThanOrEqual(390);

          // Test touch interactions on photo cards
          await photoCards.hover();

          // Check for mobile-optimized action buttons
          const actionButtons = photoCards.locator('button');

          for (let i = 0; i < await actionButtons.count(); i++) {
            const button = actionButtons.nth(i);
            if (await button.isVisible()) {
              const buttonBox = await button.boundingBox();
              expect(buttonBox?.height).toBeGreaterThanOrEqual(32); // Minimum for small action buttons
            }
          }
        }
      }
    });
  });

  test('Touch Events and Gestures', async ({ page }) => {
    // Set mobile viewport with touch support
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('http://localhost:3000/tech/login');
    await page.fill('input[type="text"]', 'FMOQY2');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/tech/dashboard');
    await page.waitForLoadState('networkidle');

    await test.step('Touch tap optimization', async () => {
      // Test tap delay elimination
      const submitButton = page.locator('button:has-text("Submit Content")');

      // Measure tap response time
      const startTime = Date.now();
      await submitButton.click();
      const endTime = Date.now();

      // Modal should appear quickly (less than 500ms including network)
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000); // Should be fast due to touch-action: manipulation

      // Close modal
      await page.click('button:has-text("Cancel")');
    });

    await test.step('Scroll performance', async () => {
      // Test smooth scrolling on mobile
      await page.evaluate(() => {
        window.scrollTo(0, 200);
      });

      await page.waitForTimeout(500);

      const scrollPosition = await page.evaluate(() => window.scrollY);
      expect(scrollPosition).toBeGreaterThan(0);

      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
    });
  });

  test('Mobile CSS Classes Application', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('http://localhost:3000/tech/login');
    await page.fill('input[type="text"]', 'FMOQY2');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/tech/dashboard');
    await page.waitForLoadState('networkidle');

    await test.step('Verify mobile optimization classes', async () => {
      // Check main container has mobile-spacing
      const mainContainer = page.locator('div.mobile-spacing').first();
      await expect(mainContainer).toBeVisible();

      // Open modal to test modal classes
      await page.click('button:has-text("Submit Content")');

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Verify modal has mobile optimization classes
      await expect(modal).toHaveClass(/photo-modal/);
      await expect(modal).toHaveClass(/mobile-optimized/);

      // Check buttons have touch optimization classes
      const buttons = modal.locator('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const classes = await button.getAttribute('class');
          expect(classes).toContain('touch-manipulation');
        }
      }

      await page.click('button:has-text("Cancel")');
    });
  });

  test('Responsive Breakpoints', async ({ page }) => {
    const breakpoints = [
      { name: 'Mobile Small', width: 375 },
      { name: 'Mobile Large', width: 414 },
      { name: 'Tablet', width: 768 },
      { name: 'Desktop', width: 1024 }
    ];

    for (const { name, width } of breakpoints) {
      await test.step(`Test ${name} breakpoint (${width}px)`, async () => {
        await page.setViewportSize({ width, height: 844 });

        await page.goto('http://localhost:3000/tech/login');
        await page.fill('input[type="text"]', 'FMOQY2');
        await page.click('button[type="submit"]');

        await page.waitForURL('**/tech/dashboard');
        await page.waitForLoadState('networkidle');

        // Check layout adapts to breakpoint
        const statsGrid = page.locator('[class*="grid-cols-1"][class*="md:grid-cols-2"][class*="lg:grid-cols-4"]');
        await expect(statsGrid).toBeVisible();

        // Verify grid columns change based on breakpoint
        const gridStyles = await statsGrid.evaluate((el) => {
          return window.getComputedStyle(el).gridTemplateColumns;
        });

        if (width < 768) {
          // Mobile: should be 1 column
          expect(gridStyles).toMatch(/^1fr$|^none$/);
        } else if (width < 1024) {
          // Tablet: should be 2 columns
          expect(gridStyles).toMatch(/1fr 1fr|repeat\(2,/);
        } else {
          // Desktop: should be 4 columns
          expect(gridStyles).toMatch(/1fr 1fr 1fr 1fr|repeat\(4,/);
        }
      });
    }
  });
});