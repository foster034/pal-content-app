import { test, expect } from '@playwright/test';

test('Test Notification Switches in Profile Settings', async ({ page }) => {
  // Test credentials from .env
  const testEmail = process.env.PLAYWRIGHT_DEMO_EMAIL!;
  const testPassword = process.env.PLAYWRIGHT_DEMO_PASSWORD!;

  console.log('Testing notification switches in profile settings...');

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

  // Click on Settings tab
  console.log('Clicking Settings tab...');
  await page.click('button:has-text("Settings")');
  await page.waitForTimeout(1000);

  // Take a screenshot of the notification settings
  await page.screenshot({ path: 'notification-settings-with-switches.png', fullPage: true });
  console.log('Screenshot saved as notification-settings-with-switches.png');

  // Check if notification switches are visible
  console.log('Checking for notification switches...');

  // Look for switches using various selectors
  const switches = await page.locator('[role="switch"]').count();
  console.log(`Found ${switches} switch elements`);

  // Check specific switch elements
  const emailSwitch = page.locator('[role="switch"]').first();
  await expect(emailSwitch).toBeVisible();
  console.log('✅ Email notification switch is visible');

  // Test clicking a switch
  const initialState = await emailSwitch.getAttribute('aria-checked');
  console.log('Initial email switch state:', initialState);

  await emailSwitch.click();
  await page.waitForTimeout(500);

  const newState = await emailSwitch.getAttribute('aria-checked');
  console.log('New email switch state after click:', newState);

  // Verify the state changed
  expect(newState).not.toBe(initialState);
  console.log('✅ Switch state changes when clicked');

  // Check for all expected notification sections
  const sections = [
    'Communication Methods',
    'Job & Tech Updates',
    'System & Reports',
    'Marketing & Promotional'
  ];

  for (const section of sections) {
    const sectionElement = page.locator(`text=${section}`);
    await expect(sectionElement).toBeVisible();
    console.log(`✅ ${section} section found`);
  }

  // Check for specific notification types
  const notificationTypes = [
    'Email Notifications',
    'SMS Notifications',
    'Browser Notifications',
    'Job Completion Alerts',
    'Tech Status Updates',
    'Photo Approvals',
    'Critical System Alerts',
    'System Alerts',
    'Weekly Reports',
    'Marketing Emails'
  ];

  for (const type of notificationTypes) {
    const typeElement = page.locator(`text=${type}`);
    await expect(typeElement).toBeVisible();
    console.log(`✅ ${type} option found`);
  }

  // Check for Save button
  const saveButton = page.locator('button:has-text("Save Notification Settings")');
  await expect(saveButton).toBeVisible();
  console.log('✅ Save Notification Settings button found');

  console.log('\n✅ All notification switch tests passed!');
  console.log('Notification settings are properly implemented with:');
  console.log('  - All notification sections present');
  console.log('  - All notification types visible');
  console.log('  - Toggle switches are functional');
  console.log('  - Save button is available');
});