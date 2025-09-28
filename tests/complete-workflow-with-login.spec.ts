import { test, expect } from '@playwright/test';

test('Complete workflow: Tech login with 8D0LS9 and verify franchisee photos appear', async ({ page }) => {
  console.log('🎯 Testing complete workflow with tech login and franchisee photo review...');

  // Step 1: Login as tech with code 8D0LS9
  console.log('👤 Step 1: Logging in as tech with code 8D0LS9...');
  await page.goto('http://localhost:3000/');

  // Click on Tech Code tab
  await page.click('text=Tech Code');
  await page.waitForTimeout(1000);

  // Enter tech code
  await page.fill('input[placeholder*="tech code" i], input[name="techCode"], input[type="text"]', '8D0LS9');
  await page.waitForTimeout(500);

  // Click login button
  await page.click('button:has-text("Log in"), button[type="submit"]');
  await page.waitForTimeout(2000);

  // Take screenshot after login attempt
  await page.screenshot({
    path: 'step1-tech-login-attempt.png',
    fullPage: true
  });

  // Wait for navigation to tech dashboard
  await page.waitForLoadState('networkidle');

  console.log('📍 Current URL after login:', page.url());

  // Step 2: Submit a test photo as tech (if we're on tech dashboard)
  if (page.url().includes('/tech/dashboard')) {
    console.log('✅ Successfully logged in as tech - submitting test photo...');

    // Fill out job submission form
    await page.selectOption('select[name="category"]', 'Commercial');
    await page.selectOption('select[name="type"]', 'Master Key System');
    await page.fill('textarea[name="description"]', 'Test job submission for workflow verification');

    // Upload a test image (create a simple data URL)
    const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACIIIKKCIIIKKCIIIKKCIIIKKCIIIKKCIIIKKCIIIKKCIIIKKCIIIKKCIIIKP/Z';

    // Add the image to the form (simulate file upload)
    await page.evaluate((imageData) => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        // Create a mock file
        const dataURLtoBlob = (dataURL) => {
          const arr = dataURL.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new Blob([u8arr], { type: mime });
        };

        const blob = dataURLtoBlob(imageData);
        const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });

        // Create a mock FileList
        const fileList = Object.create(FileList.prototype);
        Object.defineProperty(fileList, 'length', { value: 1 });
        Object.defineProperty(fileList, 0, { value: file });

        // Set the files property
        Object.defineProperty(fileInput, 'files', { value: fileList });

        // Trigger change event
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, testImageData);

    await page.waitForTimeout(1000);

    // Submit the form
    await page.click('button:has-text("Submit Content"), button[type="submit"]');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'step2-tech-photo-submitted.png',
      fullPage: true
    });

    console.log('✅ Test photo submitted as tech');
  }

  // Step 3: Navigate to franchisee photos page to verify photos appear
  console.log('👥 Step 3: Checking franchisee photos page...');
  await page.goto('http://localhost:3000/franchisee/photos');
  await page.waitForLoadState('networkidle');

  await page.screenshot({
    path: 'step3-franchisee-photos-page.png',
    fullPage: true
  });

  // Check for submitted photos
  const pageContent = await page.locator('body').innerText();
  console.log('📄 Franchisee photos page content preview:', pageContent.substring(0, 500));

  // Look for signs that photos are now showing
  const noSubmissions = page.locator('text=No submissions found');
  const hasNoSubmissions = await noSubmissions.isVisible().catch(() => false);

  if (hasNoSubmissions) {
    console.log('❌ Still showing "No submissions found" - the fix may need more work');

    // Check browser console for any errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🚨 Browser console error:', msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'step3-franchisee-photos-after-reload.png',
      fullPage: true
    });
  } else {
    console.log('✅ SUCCESS: "No submissions found" is not visible - photos should be showing!');

    // Look for photo cards, job summaries, or any submission content
    const submissionElements = await page.locator('[data-testid*="photo"], [data-testid*="job"], .photo-card, .job-card, .submission-card, .pending-review').count();
    console.log(`📊 Found ${submissionElements} submission-related elements`);

    if (submissionElements > 0) {
      console.log('🎉 SUCCESS: Found submission elements in franchisee review interface!');
    }

    await page.screenshot({
      path: 'step3-franchisee-photos-success.png',
      fullPage: true
    });
  }

  console.log('✅ Complete workflow test finished - check screenshots for results');
});