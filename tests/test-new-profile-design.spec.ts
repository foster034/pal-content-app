import { test, expect } from '@playwright/test';

test('Test New Profile Page Design', async ({ page }) => {
  // Test credentials from .env
  const testEmail = process.env.PLAYWRIGHT_DEMO_EMAIL!;
  const testPassword = process.env.PLAYWRIGHT_DEMO_PASSWORD!;

  console.log('Testing new profile page design...');

  // Navigate to login page
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForLoadState('networkidle');

  // Login
  console.log('Logging in...');
  await page.fill('#email', testEmail);
  await page.fill('#password', testPassword);
  await page.click('button[type="submit"]');

  // Wait for navigation to admin dashboard
  await page.waitForURL('http://localhost:3000/admin', { timeout: 10000 });

  // Navigate to profile page
  console.log('Navigating to profile page...');
  await page.goto('http://localhost:3000/admin/profile');
  await page.waitForLoadState('networkidle');

  // Take a screenshot of the new design
  await page.screenshot({ path: 'new-profile-design.png', fullPage: true });
  console.log('Screenshot saved as new-profile-design.png');

  // Verify key elements exist
  console.log('Verifying profile elements...');

  // Check for gradient header
  const gradientHeader = page.locator('.bg-gradient-to-r.from-blue-600');
  await expect(gradientHeader).toBeVisible();
  console.log('✅ Gradient header present');

  // Check for avatar
  const avatar = page.locator('.h-32.w-32');
  await expect(avatar).toBeVisible();
  console.log('✅ Large avatar present');

  // Check for tabs
  const personalTab = page.locator('button:has-text("Personal Info")');
  const addressTab = page.locator('button:has-text("Address")');
  const accountTab = page.locator('button:has-text("Account")');
  const settingsTab = page.locator('button:has-text("Settings")');

  await expect(personalTab).toBeVisible();
  await expect(addressTab).toBeVisible();
  await expect(accountTab).toBeVisible();
  await expect(settingsTab).toBeVisible();
  console.log('✅ All tabs present');

  // Test tab navigation
  console.log('Testing tab navigation...');

  // Click Address tab
  await addressTab.click();
  await page.waitForTimeout(500);
  const addressContent = page.locator('text=Street Address');
  await expect(addressContent).toBeVisible();
  console.log('✅ Address tab working');

  // Click Account tab
  await accountTab.click();
  await page.waitForTimeout(500);
  const accountContent = page.locator('text=Email Address');
  await expect(accountContent).toBeVisible();
  console.log('✅ Account tab working');

  // Click Settings tab
  await settingsTab.click();
  await page.waitForTimeout(500);
  const settingsContent = page.locator('text=Notifications');
  await expect(settingsContent).toBeVisible();
  console.log('✅ Settings tab working');

  // Go back to Personal Info tab
  await personalTab.click();
  await page.waitForTimeout(500);

  // Test Edit Profile functionality
  console.log('Testing edit mode...');
  await page.click('button:has-text("Edit Profile")');
  await page.waitForTimeout(500);

  // Check if Save and Cancel buttons appear
  const saveButton = page.locator('button:has-text("Save")');
  const cancelButton = page.locator('button:has-text("Cancel")');
  await expect(saveButton).toBeVisible();
  await expect(cancelButton).toBeVisible();
  console.log('✅ Edit mode activated');

  // Cancel editing
  await cancelButton.click();
  await page.waitForTimeout(500);

  // Check sidebar elements
  console.log('Checking sidebar...');
  const profileCompletion = page.locator('text=Profile Completion');
  const quickActions = page.locator('text=Quick Actions');
  await expect(profileCompletion).toBeVisible();
  await expect(quickActions).toBeVisible();
  console.log('✅ Sidebar elements present');

  console.log('\n✅ All tests passed! New profile design is working correctly.');
  console.log('The profile page now features:');
  console.log('  - Modern gradient header with cover image');
  console.log('  - Large avatar with edit capabilities');
  console.log('  - Tabbed navigation for better organization');
  console.log('  - Separate sections for Personal, Address, Account, and Settings');
  console.log('  - Profile completion progress indicator');
  console.log('  - Quick actions sidebar');
  console.log('  - Clean, modern card-based design');
});