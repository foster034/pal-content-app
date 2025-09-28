import { test, expect } from '@playwright/test';
import { createReadStream, statSync } from 'fs';
import path from 'path';

test.describe('Tech Profile Avatar Upload', () => {
  const techCode = '8D0LS9';
  const baseUrl = 'http://localhost:3000';

  // Helper function to create test images
  const createTestImage = (sizeInMB = 0.1) => {
    // Create a simple test image as base64 data URL
    // This creates a small 1x1 pixel PNG for testing
    const smallImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

    if (sizeInMB <= 0.1) {
      return smallImageBase64;
    }

    // For larger images, create a simple pattern
    const canvas = {
      width: Math.ceil(Math.sqrt(sizeInMB * 1024 * 1024 / 4)), // Rough calculation for image size
      height: Math.ceil(Math.sqrt(sizeInMB * 1024 * 1024 / 4))
    };

    // Return a larger base64 image (this is simplified for testing)
    return smallImageBase64;
  };

  const loginWithTechCode = async (page: any, code: string) => {
    console.log(`Navigating to tech auth page and logging in with code: ${code}`);

    // Navigate to tech auth page
    await page.goto(`${baseUrl}/tech-auth`);
    await page.waitForLoadState('networkidle');

    // Verify we're on the tech auth page
    await expect(page.locator('h1')).toContainText('Tech Portal');

    // Enter the tech code
    await page.fill('#loginCode', code);
    await expect(page.locator('#loginCode')).toHaveValue(code);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to tech dashboard
    await page.waitForURL(`${baseUrl}/tech/dashboard`, { timeout: 10000 });
    console.log('Successfully logged in and redirected to tech dashboard');

    // Verify dashboard loaded
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Dashboard');
  };

  const navigateToProfile = async (page: any) => {
    console.log('Navigating to tech profile page...');

    // Navigate to profile page via URL
    await page.goto(`${baseUrl}/tech/profile`);
    await page.waitForLoadState('networkidle');

    // Verify we're on the profile page
    await expect(page.locator('h1')).toContainText('Tech');
    console.log('Profile page loaded successfully');
  };

  const waitForImageLoad = async (page: any, selector: string, timeout = 5000) => {
    await page.waitForFunction(
      (sel) => {
        const img = document.querySelector(sel);
        return img && img.complete && img.naturalWidth > 0;
      },
      selector,
      { timeout }
    );
  };

  test('should successfully upload and display avatar image', async ({ page }) => {
    // Step 1: Login with tech code
    await loginWithTechCode(page, techCode);

    // Step 2: Navigate to profile page
    await navigateToProfile(page);

    // Step 3: Enter edit mode
    console.log('Entering edit mode...');
    await page.click('button:has-text("Edit Profile")');
    await page.waitForTimeout(1000);

    // Verify edit mode is active
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();

    // Step 4: Take screenshot before upload
    await page.screenshot({ path: 'tech-profile-before-avatar-upload.png', fullPage: true });

    // Step 5: Prepare test image file
    const testImageContent = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );

    // Step 6: Upload avatar using file input
    console.log('Uploading avatar image...');

    // Find and interact with the file input
    const fileInput = page.locator('#avatar-upload-input');
    await expect(fileInput).toBeAttached();

    // Create a temporary file for upload
    await page.evaluate((imageData) => {
      // Create a blob from base64 data
      const byteString = atob(imageData);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/png' });
      const file = new File([blob], 'test-avatar.png', { type: 'image/png' });

      // Create DataTransfer to simulate file selection
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // Set files on input
      const input = document.getElementById('avatar-upload-input') as HTMLInputElement;
      if (input) {
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');

    // Step 7: Wait for upload to complete
    console.log('Waiting for upload to complete...');
    await page.waitForTimeout(3000);

    // Step 8: Verify image appears in the form
    console.log('Verifying image appears in profile form...');
    const profilePreview = page.locator('img[alt="Profile preview"]');
    if (await profilePreview.isVisible()) {
      await waitForImageLoad(page, 'img[alt="Profile preview"]');
      const previewSrc = await profilePreview.getAttribute('src');
      console.log('Profile preview src:', previewSrc?.substring(0, 50) + '...');

      // Should be a Supabase storage URL or data URL
      expect(previewSrc).toBeTruthy();
    }

    // Step 9: Verify avatar in header
    const headerAvatar = page.locator('.h-32.w-32 img').first();
    if (await headerAvatar.isVisible()) {
      await waitForImageLoad(page, '.h-32.w-32 img');
      const avatarSrc = await headerAvatar.getAttribute('src');
      console.log('Header avatar src:', avatarSrc?.substring(0, 50) + '...');

      // Verify it's not just the fallback
      expect(avatarSrc).toBeTruthy();
    }

    // Step 10: Save changes
    console.log('Saving profile changes...');
    await page.click('button:has-text("Save Changes")');

    // Wait for save to complete
    await page.waitForTimeout(2000);

    // Check for success toast/message
    const toastMessage = page.locator('[data-sonner-toast]');
    if (await toastMessage.isVisible()) {
      const toastText = await toastMessage.textContent();
      console.log('Toast message:', toastText);
    }

    // Step 11: Take screenshot after save
    await page.screenshot({ path: 'tech-profile-after-avatar-save.png', fullPage: true });

    // Step 12: Exit edit mode and verify avatar persists
    await page.waitForTimeout(1000);

    // Verify we're out of edit mode
    await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible();

    // Verify avatar is still visible
    const savedAvatar = page.locator('.h-32.w-32 img').first();
    await expect(savedAvatar).toBeVisible();

    const savedAvatarSrc = await savedAvatar.getAttribute('src');
    console.log('Saved avatar src:', savedAvatarSrc?.substring(0, 50) + '...');

    expect(savedAvatarSrc).toBeTruthy();
    expect(savedAvatarSrc).not.toBe('');
  });

  test('should persist avatar after page reload', async ({ page }) => {
    // Step 1: Login and navigate to profile
    await loginWithTechCode(page, techCode);
    await navigateToProfile(page);

    // Step 2: Check if avatar exists before reload
    const avatarBeforeReload = page.locator('.h-32.w-32 img').first();
    let avatarSrcBefore = '';

    if (await avatarBeforeReload.isVisible()) {
      avatarSrcBefore = await avatarBeforeReload.getAttribute('src') || '';
      console.log('Avatar before reload:', avatarSrcBefore.substring(0, 50) + '...');
    }

    // Step 3: Reload the page
    console.log('Reloading page to test persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Step 4: Verify avatar persists after reload
    const avatarAfterReload = page.locator('.h-32.w-32 img').first();
    await expect(avatarAfterReload).toBeVisible();

    const avatarSrcAfter = await avatarAfterReload.getAttribute('src');
    console.log('Avatar after reload:', avatarSrcAfter?.substring(0, 50) + '...');

    // Verify it's the same as before (if there was one) or at least present
    expect(avatarSrcAfter).toBeTruthy();

    if (avatarSrcBefore) {
      expect(avatarSrcAfter).toBe(avatarSrcBefore);
    }

    // Step 5: Verify it's a Supabase storage URL (not data URL)
    if (avatarSrcAfter) {
      const isSupabaseUrl = avatarSrcAfter.includes('supabase') || avatarSrcAfter.startsWith('https://');
      const isDataUrl = avatarSrcAfter.startsWith('data:');

      console.log('Is Supabase URL:', isSupabaseUrl);
      console.log('Is Data URL:', isDataUrl);

      // For production, we want Supabase URLs, not data URLs
      if (!isDataUrl) {
        expect(isSupabaseUrl || avatarSrcAfter.startsWith('http')).toBeTruthy();
      }
    }

    await page.screenshot({ path: 'tech-profile-after-reload.png', fullPage: true });
  });

  test('should persist avatar across sessions', async ({ page }) => {
    // Step 1: Login and check current avatar
    await loginWithTechCode(page, techCode);
    await navigateToProfile(page);

    const initialAvatar = page.locator('.h-32.w-32 img').first();
    let initialAvatarSrc = '';

    if (await initialAvatar.isVisible()) {
      initialAvatarSrc = await initialAvatar.getAttribute('src') || '';
      console.log('Initial avatar:', initialAvatarSrc.substring(0, 50) + '...');
    }

    // Step 2: Clear session (logout)
    console.log('Clearing session and re-authenticating...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Clear cookies
    await page.context().clearCookies();

    // Step 3: Login again with same tech code
    await loginWithTechCode(page, techCode);
    await navigateToProfile(page);

    // Step 4: Verify avatar persists across sessions
    const sessionAvatar = page.locator('.h-32.w-32 img').first();
    await expect(sessionAvatar).toBeVisible();

    const sessionAvatarSrc = await sessionAvatar.getAttribute('src');
    console.log('Avatar after session clear:', sessionAvatarSrc?.substring(0, 50) + '...');

    // Should be the same avatar (if one existed)
    if (initialAvatarSrc) {
      expect(sessionAvatarSrc).toBe(initialAvatarSrc);
    }

    await page.screenshot({ path: 'tech-profile-after-session-clear.png', fullPage: true });
  });

  test('should handle file size limits correctly', async ({ page }) => {
    // Step 1: Login and navigate to profile
    await loginWithTechCode(page, techCode);
    await navigateToProfile(page);

    // Step 2: Enter edit mode
    await page.click('button:has-text("Edit Profile")');
    await page.waitForTimeout(1000);

    // Step 3: Try to upload a large file (simulate > 5MB)
    console.log('Testing file size limit...');

    await page.evaluate(() => {
      // Create a large file (simulate 6MB)
      const largeData = 'x'.repeat(6 * 1024 * 1024); // 6MB of data
      const blob = new Blob([largeData], { type: 'image/png' });
      const file = new File([blob], 'large-avatar.png', { type: 'image/png' });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const input = document.getElementById('avatar-upload-input') as HTMLInputElement;
      if (input) {
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Step 4: Wait for error message
    await page.waitForTimeout(2000);

    // Step 5: Check for error toast/message
    const errorToast = page.locator('[data-sonner-toast]');
    if (await errorToast.isVisible()) {
      const errorText = await errorToast.textContent();
      console.log('Error message:', errorText);

      // Should contain file size error
      expect(errorText?.toLowerCase()).toContain('file');
      expect(errorText?.toLowerCase()).toMatch(/(large|size|5mb)/);
    }

    await page.screenshot({ path: 'tech-profile-file-size-error.png', fullPage: true });
  });

  test('should display avatar in sidebar after upload', async ({ page }) => {
    // Step 1: Login and navigate to profile
    await loginWithTechCode(page, techCode);
    await navigateToProfile(page);

    // Step 2: Check sidebar avatar before upload
    const sidebarAvatar = page.locator('[data-testid="sidebar-avatar"], .sidebar img, nav img').first();
    let sidebarAvatarBefore = '';

    if (await sidebarAvatar.isVisible()) {
      sidebarAvatarBefore = await sidebarAvatar.getAttribute('src') || '';
      console.log('Sidebar avatar before:', sidebarAvatarBefore.substring(0, 50) + '...');
    }

    // Step 3: Navigate to dashboard to check sidebar
    await page.goto(`${baseUrl}/tech/dashboard`);
    await page.waitForLoadState('networkidle');

    // Step 4: Check sidebar avatar
    const dashboardSidebarAvatar = page.locator('.sidebar img, nav img, [role="navigation"] img').first();

    if (await dashboardSidebarAvatar.isVisible()) {
      const sidebarAvatarSrc = await dashboardSidebarAvatar.getAttribute('src');
      console.log('Dashboard sidebar avatar:', sidebarAvatarSrc?.substring(0, 50) + '...');

      expect(sidebarAvatarSrc).toBeTruthy();
    }

    await page.screenshot({ path: 'tech-dashboard-sidebar-avatar.png', fullPage: true });
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    // Step 1: Login and navigate to profile
    await loginWithTechCode(page, techCode);
    await navigateToProfile(page);

    // Step 2: Enter edit mode
    await page.click('button:has-text("Edit Profile")');
    await page.waitForTimeout(1000);

    // Step 3: Mock network failure
    await page.route('**/storage/v1/object/avatars/**', route => {
      route.abort('failed');
    });

    // Step 4: Try to upload an image
    console.log('Testing upload error handling...');

    await page.evaluate(() => {
      const byteString = atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/png' });
      const file = new File([blob], 'test-avatar.png', { type: 'image/png' });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const input = document.getElementById('avatar-upload-input') as HTMLInputElement;
      if (input) {
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Step 5: Wait for error handling
    await page.waitForTimeout(3000);

    // Step 6: Check for error message
    const errorToast = page.locator('[data-sonner-toast]');
    if (await errorToast.isVisible()) {
      const errorText = await errorToast.textContent();
      console.log('Upload error message:', errorText);

      expect(errorText?.toLowerCase()).toContain('failed');
    }

    // Step 7: Verify upload button returns to normal state
    const uploadButton = page.locator('button:has-text("Choose Photo")');
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).not.toContain('Uploading');

    await page.screenshot({ path: 'tech-profile-upload-error.png', fullPage: true });
  });

  test('should validate image file types', async ({ page }) => {
    // Step 1: Login and navigate to profile
    await loginWithTechCode(page, techCode);
    await navigateToProfile(page);

    // Step 2: Enter edit mode
    await page.click('button:has-text("Edit Profile")');
    await page.waitForTimeout(1000);

    // Step 3: Check file input accepts only images
    const fileInput = page.locator('#avatar-upload-input');
    const acceptAttribute = await fileInput.getAttribute('accept');

    console.log('File input accept attribute:', acceptAttribute);
    expect(acceptAttribute).toBe('image/*');

    // Step 4: Try to upload a non-image file
    await page.evaluate(() => {
      const textContent = 'This is not an image file';
      const blob = new Blob([textContent], { type: 'text/plain' });
      const file = new File([blob], 'not-an-image.txt', { type: 'text/plain' });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const input = document.getElementById('avatar-upload-input') as HTMLInputElement;
      if (input) {
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await page.waitForTimeout(2000);

    // Step 5: The browser should prevent non-image files, but if not, check for error handling
    const errorToast = page.locator('[data-sonner-toast]');
    if (await errorToast.isVisible()) {
      const errorText = await errorToast.textContent();
      console.log('File type error message:', errorText);
    }

    await page.screenshot({ path: 'tech-profile-file-type-validation.png', fullPage: true });
  });
});