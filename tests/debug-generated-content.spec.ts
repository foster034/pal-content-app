import { test, expect } from '@playwright/test';

test.describe('Debug Generated Content Save', () => {
  test('Login and test GMB post generation', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    // Listen to network requests
    page.on('request', request => {
      if (request.url().includes('/api/generated-content')) {
        console.log('REQUEST to generated-content:', request.method(), request.postData());
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/generated-content')) {
        console.log('RESPONSE from generated-content:', response.status());
        try {
          const body = await response.json();
          console.log('RESPONSE BODY:', JSON.stringify(body, null, 2));
        } catch (e) {
          console.log('Could not parse response body');
        }
      }
    });

    // Go to login page
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    // Login
    console.log('Logging in...');
    await page.fill('input[type="email"]', 'brentfoster.popalock@gmail.com');
    await page.fill('input[type="password"]', 'B69706034');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin
    await page.waitForURL('**/admin**', { timeout: 10000 });
    console.log('Logged in successfully');

    // Navigate to marketing page
    console.log('Navigating to marketing page...');
    await page.goto('http://localhost:3000/admin/marketing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Wait for media archive to load
    console.log('Waiting for media archive to load...');
    await page.waitForSelector('text=Approved Submissions', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Find and click AI Marketing button on first photo
    console.log('Looking for AI Marketing button...');
    const aiButton = page.locator('button[title*="AI Marketing"], button:has-text("AI")').first();
    await aiButton.waitFor({ state: 'visible', timeout: 10000 });
    await aiButton.click();

    console.log('Clicked AI Marketing button');
    await page.waitForTimeout(2000);

    // Wait for modal to open
    console.log('Waiting for modal...');
    await page.waitForSelector('text=What type of post do you want to create?', { timeout: 10000 });

    // Select a post type (click on the card, not a button)
    console.log('Selecting Success Story...');
    await page.click('text=Success Story');
    await page.waitForTimeout(1000);

    // Click Next
    console.log('Clicking Next...');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);

    // Skip adding details, click Generate
    console.log('Clicking Generate...');
    const generateButton = page.getByRole('button', { name: 'Generate', exact: true });
    await generateButton.click();

    // Wait for content to be generated
    console.log('Waiting for content generation...');
    await page.waitForSelector('text=Review Content', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Look for Draft button
    console.log('Looking for Draft button...');
    const draftButton = page.getByRole('button', { name: 'Draft' });
    await draftButton.waitFor({ state: 'visible', timeout: 5000 });

    console.log('Clicking Draft...');
    await draftButton.click();

    // Wait for any error or success messages
    await page.waitForTimeout(3000);

    // Check for error dialogs
    const errorDialog = await page.locator('text=Failed to save').isVisible().catch(() => false);
    if (errorDialog) {
      console.log('ERROR: Failed to save dialog appeared');
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    }

    // Take final screenshot
    await page.screenshot({ path: 'final-state.png', fullPage: true });

    console.log('Test completed');
  });
});
