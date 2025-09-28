import { test, expect, devices } from '@playwright/test';

// Configure mobile viewport for all tests in this file
test.use({ ...devices['iPhone 12 Pro'] });

test.describe('Mobile Responsiveness Tests', () => {
  test('Mobile login page responsiveness', async ({ page }) => {
    console.log('Testing mobile login page responsiveness...');

    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    console.log('✅ Login page loaded');

    // Take screenshot of mobile login page
    await page.screenshot({ path: 'mobile-login-page.png', fullPage: true });

    // Test mobile viewport
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBe(390); // iPhone 12 Pro width
    expect(viewportSize?.height).toBe(664); // iPhone 12 Pro height
    console.log(`✅ Mobile viewport confirmed: ${viewportSize?.width}x${viewportSize?.height}px`);

    // Test that form elements are properly sized for mobile
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const loginButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    console.log('✅ Login form elements are visible on mobile');

    // Test touch target sizes
    const buttonBox = await loginButton.boundingBox();
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target
      console.log(`✅ Login button meets touch target size: ${buttonBox.width}x${buttonBox.height}px`);
    }

    // Test form interaction on mobile
    await emailInput.fill('test@example.com');
    await passwordInput.fill('testpassword');
    console.log('✅ Form inputs work on mobile');

    // Test Remember Me switch
    const rememberSwitch = page.locator('#remember');
    if (await rememberSwitch.isVisible()) {
      await rememberSwitch.click();
      console.log('✅ Remember Me switch works on mobile');
    }

    // Clear inputs for clean state
    await emailInput.clear();
    await passwordInput.clear();
  });

  test('Mobile CSS and touch optimizations', async ({ page }) => {
    console.log('Testing mobile CSS optimizations...');

    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    // Test CSS touch-action property
    const touchElements = await page.$$('button, a, [role="button"]');
    let touchOptimizedCount = 0;

    for (const element of touchElements) {
      const touchAction = await element.evaluate(el =>
        window.getComputedStyle(el).getPropertyValue('touch-action')
      );
      if (touchAction === 'manipulation') {
        touchOptimizedCount++;
      }
    }

    console.log(`✅ ${touchOptimizedCount} elements have touch-action optimization`);

    // Test that inputs have proper font-size to prevent zoom on iOS
    const inputs = await page.$$('input[type="email"], input[type="password"], input[type="text"]');
    for (const input of inputs) {
      const fontSize = await input.evaluate(el =>
        parseInt(window.getComputedStyle(el).fontSize)
      );
      expect(fontSize).toBeGreaterThanOrEqual(16);
    }
    console.log(`✅ All ${inputs.length} inputs have font-size ≥ 16px to prevent iOS zoom`);

    // Test scrolling behavior
    const scrollableElements = await page.$$('.overflow-y-auto, .overflow-auto');
    console.log(`✅ Found ${scrollableElements.length} scrollable elements`);
  });

  test('Mobile viewport meta tag and responsive design', async ({ page }) => {
    console.log('Testing viewport meta tag and responsive design...');

    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    // Check viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toContain('width=device-width');
    expect(viewportMeta).toContain('initial-scale=1');
    console.log(`✅ Proper viewport meta tag: ${viewportMeta}`);

    // Test responsive breakpoints by checking if elements adapt
    const container = page.locator('body').first();
    const containerWidth = await container.evaluate(el => el.offsetWidth);

    expect(containerWidth).toBeLessThanOrEqual(390); // Should fit in mobile viewport
    console.log(`✅ Container adapts to mobile width: ${containerWidth}px`);

    // Test that text is readable (not too small)
    const textElements = await page.$$('p, span, label, h1, h2, h3');
    let readableTextCount = 0;

    for (const element of textElements) {
      const fontSize = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return parseInt(style.fontSize);
      });

      if (fontSize >= 14) { // Minimum readable size on mobile
        readableTextCount++;
      }
    }

    console.log(`✅ ${readableTextCount}/${textElements.length} text elements are readable on mobile`);
  });

  test('Mobile navigation and interaction patterns', async ({ page }) => {
    console.log('Testing mobile navigation patterns...');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Take screenshot of home page on mobile
    await page.screenshot({ path: 'mobile-home-page.png', fullPage: true });

    // Test that the page is responsive
    const viewportSize = page.viewportSize();
    console.log(`✅ Testing on mobile viewport: ${viewportSize?.width}x${viewportSize?.height}px`);

    // Look for any navigation elements
    const navElements = await page.$$('nav, [role="navigation"], button');
    console.log(`✅ Found ${navElements.length} navigation elements`);

    // Test touch target sizes for any interactive elements
    const interactiveElements = await page.$$('button, a, input, [role="button"]');
    let goodTouchTargets = 0;

    for (const element of interactiveElements) {
      const box = await element.boundingBox();
      if (box && box.height >= 44 && box.width >= 44) {
        goodTouchTargets++;
      }
    }

    console.log(`✅ ${goodTouchTargets}/${interactiveElements.length} elements meet touch target guidelines`);
  });

  test('Test actual admin sidebar on mobile (if accessible)', async ({ page }) => {
    console.log('Testing admin sidebar responsiveness...');

    // Try to access admin page directly
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    if (currentUrl.includes('/auth/login')) {
      console.log('🔐 Redirected to login - admin requires authentication');
      await page.screenshot({ path: 'mobile-admin-login-redirect.png', fullPage: true });
    } else if (currentUrl.includes('/admin')) {
      console.log('✅ Admin page accessible - testing sidebar');
      await page.screenshot({ path: 'mobile-admin-direct.png', fullPage: true });

      // Look for any button that might be the hamburger menu
      const buttons = await page.$$('button');
      console.log(`Found ${buttons.length} buttons on admin page`);

      // Look for elements that might be the mobile header
      const mobileHeader = await page.$('.md\\:hidden');
      if (mobileHeader) {
        console.log('✅ Mobile header detected');
        const headerButtons = await mobileHeader.$$('button');
        if (headerButtons.length > 0) {
          console.log(`✅ Found ${headerButtons.length} buttons in mobile header`);

          // Try clicking the first button (likely hamburger)
          await headerButtons[0].click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: 'mobile-admin-menu-attempt.png', fullPage: true });
        }
      }
    }
  });
});

test.describe('Tablet Responsiveness Tests', () => {
  // Test on iPad viewport
  test.use({ ...devices['iPad Pro'] });

  test('Tablet view behavior', async ({ page }) => {
    console.log('Testing tablet view behavior...');

    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    // Check viewport size
    const viewportSize = page.viewportSize();
    console.log(`💻 Tablet viewport: ${viewportSize?.width}x${viewportSize?.height}px`);

    // Take screenshot
    await page.screenshot({ path: 'tablet-login-view.png', fullPage: true });

    // Test that form scales appropriately for tablet
    const container = page.locator('body').first();
    const containerWidth = await container.evaluate(el => el.offsetWidth);

    expect(containerWidth).toBeGreaterThan(768); // Should be wider than mobile
    console.log(`✅ Tablet layout uses more space: ${containerWidth}px`);
  });
});