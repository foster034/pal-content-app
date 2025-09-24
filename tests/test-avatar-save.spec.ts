import { test, expect } from '@playwright/test';

test('Avatar Image Save Test', async ({ page }) => {
  // Test credentials from .env
  const testEmail = process.env.PLAYWRIGHT_DEMO_EMAIL!;
  const testPassword = process.env.PLAYWRIGHT_DEMO_PASSWORD!;

  console.log('Starting avatar save test...');

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

  // Create a simple test image (1x1 pixel PNG)
  const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

  // Simulate uploading an avatar by directly setting the form data
  console.log('Setting avatar image...');
  await page.evaluate((imageData) => {
    // Find the form data setter and call it directly
    const event = new CustomEvent('avatarUpdate', { detail: imageData });
    window.dispatchEvent(event);
  }, testImageBase64);

  // Alternative approach: use the file input directly
  await page.evaluate((imageData) => {
    // Create a blob from the base64 data
    const byteString = atob(imageData.split(',')[1]);
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], 'test-avatar.png', { type: mimeString });

    // Find the ImageUploader component and trigger its onImageSelected callback
    const profilePicUploader = document.querySelector('input[type="file"]');
    if (profilePicUploader) {
      // Create a DataTransfer object to simulate file selection
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      profilePicUploader.files = dataTransfer.files;

      // Trigger change event
      const changeEvent = new Event('change', { bubbles: true });
      profilePicUploader.dispatchEvent(changeEvent);
    }
  }, testImageBase64);

  await page.waitForTimeout(2000);

  // Handle the crop modal that appears after image selection
  console.log('Waiting for crop modal...');
  await page.waitForSelector('button:has-text("Crop & Save")', { timeout: 5000 });
  console.log('Clicking Crop & Save...');
  await page.click('button:has-text("Crop & Save")');

  // Wait for modal to close
  await page.waitForTimeout(1000);

  // Save changes
  console.log('Clicking Save Changes button...');
  await page.click('button:has-text("Save Changes")');

  // Wait for save operation
  await page.waitForTimeout(3000);

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

  // Refresh the page to verify avatar persistence
  console.log('Refreshing page to verify avatar persistence...');
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Check if avatar is displayed
  const avatarImg = page.locator('.h-24.w-24 img'); // The large avatar in profile
  const avatarSrc = await avatarImg.getAttribute('src');

  console.log('Avatar src after refresh:', avatarSrc ? 'Present' : 'Not found');

  if (avatarSrc && avatarSrc.startsWith('data:image/')) {
    console.log('✅ SUCCESS: Avatar image was saved and persisted after refresh');
  } else {
    console.log('❌ FAILED: Avatar image was NOT saved properly');
    console.log('   Avatar src:', avatarSrc);
  }

  // Assert the avatar is present
  await expect(avatarImg).toHaveAttribute('src', /^data:image\//);

  console.log('Avatar save test completed!');
});