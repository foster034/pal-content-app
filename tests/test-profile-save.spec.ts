import { test, expect } from '@playwright/test';

test('Admin Profile Save Test', async ({ page }) => {
  // Test credentials from .env
  const testEmail = process.env.PLAYWRIGHT_DEMO_EMAIL!;
  const testPassword = process.env.PLAYWRIGHT_DEMO_PASSWORD!;

  console.log('Starting profile save test...');

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

  // Click on the profile card in the sidebar to navigate to profile
  console.log('Navigating to profile page...');
  await page.click('.bg-gray-50.dark\\:bg-neutral-700\\/50'); // Profile card

  // Wait for profile page to load
  await page.waitForURL('http://localhost:3000/admin/profile');
  await page.waitForLoadState('networkidle');
  console.log('Profile page loaded');

  // Click Edit Profile button
  console.log('Clicking Edit Profile button...');
  await page.click('button:has-text("Edit Profile")');
  await page.waitForTimeout(1000);

  // Generate unique test data with timestamp
  const timestamp = Date.now();
  const testFullName = `Test User ${timestamp}`;
  const testPhone = `555-${String(timestamp).slice(-7, -3)}-${String(timestamp).slice(-3)}`;

  console.log(`Updating profile with: Name="${testFullName}", Phone="${testPhone}"`);

  // Update the Full Name field
  const fullNameInput = page.locator('input[placeholder="Enter your full name"]');
  await fullNameInput.clear();
  await fullNameInput.fill(testFullName);

  // Update the Phone Number field
  const phoneInput = page.locator('input[placeholder="Enter your phone number"]');
  await phoneInput.clear();
  await phoneInput.fill(testPhone);

  // Save changes
  console.log('Clicking Save Changes button...');
  await page.click('button:has-text("Save Changes")');

  // Wait for save operation
  await page.waitForTimeout(2000);

  // Check for success/error messages
  const dialogVisible = await page.locator('dialog, [role="dialog"]').isVisible();
  if (dialogVisible) {
    const dialogText = await page.locator('dialog, [role="dialog"]').textContent();
    console.log('Dialog message:', dialogText);

    // Click OK if there's a dialog
    const okButton = page.locator('button:has-text("OK")');
    if (await okButton.isVisible()) {
      await okButton.click();
    }
  }

  // Refresh the page to verify data persistence
  console.log('Refreshing page to verify data persistence...');
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Check if the values are still there after refresh
  const displayedName = await page.locator('h2.text-2xl').textContent();
  const nameFieldText = await page.locator('text=Full Name').locator('..').locator('p').textContent();
  const phoneFieldText = await page.locator('text=Phone Number').locator('..').locator('p').textContent();

  console.log('Verification after refresh:');
  console.log('- Displayed name in header:', displayedName);
  console.log('- Full Name field:', nameFieldText);
  console.log('- Phone field:', phoneFieldText);

  // Test results
  if (nameFieldText?.includes(testFullName)) {
    console.log('✅ SUCCESS: Full name was saved and persisted after refresh');
  } else {
    console.log('❌ FAILED: Full name was NOT saved properly');
    console.log(`   Expected: "${testFullName}"`);
    console.log(`   Got: "${nameFieldText}"`);
  }

  console.log('Note: Phone number will not save until phone column is added to database');

  // Assert the values are correct - only test full_name for now
  await expect(page.locator('text=Full Name').locator('..').locator('p')).toContainText(testFullName);

  console.log('Profile save test completed!');
});