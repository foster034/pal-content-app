import { test, expect } from '@playwright/test';

test('Simple Avatar Save Test', async ({ page }) => {
  // Test credentials from .env
  const testEmail = process.env.PLAYWRIGHT_DEMO_EMAIL!;
  const testPassword = process.env.PLAYWRIGHT_DEMO_PASSWORD!;

  console.log('Starting simple avatar save test...');

  // Navigate to login page
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForLoadState('networkidle');

  // Login
  console.log('Logging in with test credentials...');
  await page.fill('#email', testEmail);
  await page.fill('#password', testPassword);
  await page.click('button[type="submit"]');

  // Wait for navigation to admin dashboard
  await page.waitForURL('http://localhost:3000/admin', { timeout: 10000 });
  console.log('Successfully logged in to admin dashboard');

  // Navigate to the test avatar upload page
  console.log('Navigating to test upload page...');
  await page.goto('http://localhost:3000/test-avatar-upload.html');
  await page.waitForLoadState('networkidle');

  // Create a simple test image directly in the page
  console.log('Creating test image...');
  await page.evaluate(() => {
    // Create a simple 1x1 pixel image
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    // Fill with red color
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);

    // Set the global dataUrl variable
    (window as any).dataUrl = canvas.toDataURL('image/png');
    console.log('Test image created, data URL length:', (window as any).dataUrl.length);
  });

  // Click the test upload button
  console.log('Clicking test upload button...');
  await page.click('button:has-text("Test Upload to API")');

  // Wait for the API response
  await page.waitForTimeout(3000);

  // Check the result
  const resultText = await page.locator('#result').textContent();
  console.log('API Response:', resultText);

  // Verify the response indicates success
  expect(resultText).toContain('success');
  expect(resultText).toContain('true');

  console.log('✅ Avatar save test completed successfully!');
});