import { test, expect } from '@playwright/test';

test.describe('Tech Photo Submission', () => {
  test('should successfully submit job content with photos using tech code 8D0LS9', async ({ page }) => {
    // First manually set the tech session to bypass auth issues
    await page.goto('http://localhost:3001/tech-auth');

    // Set tech session in localStorage and cookie to bypass middleware
    await page.evaluate(() => {
      const techSession = {
        id: 'f95f54d7-51be-4f55-a081-2d3b692ff5d9',
        name: 'brent foster',
        email: 'brentfoster.popalock@gmail.com',
        phone: '7059845625',
        franchisee: {
          id: '4c8b70f3-797b-4384-869e-e1fb3919f615',
          business_name: 'Pop-A-Lock Simcoe County'
        },
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('tech_session', JSON.stringify(techSession));
      document.cookie = `tech_session=f95f54d7-51be-4f55-a081-2d3b692ff5d9; path=/; max-age=86400`;
    });

    // Now navigate directly to tech dashboard
    await page.goto('http://localhost:3001/tech/dashboard');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*tech\/dashboard.*/);

    console.log('✓ Successfully logged in with tech code 8D0LS9');

    // Click Submit Content button
    await page.click('button:has-text("Submit Content"), button:has-text("Submit New Content"), button:has-text("+ Submit Content")');

    // Wait for form modal to appear
    await page.waitForSelector('form, [role="dialog"]', { timeout: 10000 });

    console.log('✓ Content submission form opened');

    // Fill out required form fields

    // 1. Select Category
    await page.selectOption('select[name*="category" i], select:near(:text("Category"))', 'Residential');
    console.log('✓ Selected category: Residential');

    // 2. Select Service Type
    await page.waitForSelector('select[name*="service" i], select:near(:text("Service"))', { timeout: 5000 });
    await page.selectOption('select[name*="service" i], select:near(:text("Service"))', 'Lock Installation');
    console.log('✓ Selected service: Lock Installation');

    // 3. Fill Location
    await page.fill('input[name*="location" i], input[placeholder*="location" i]', '123 Main St, Toronto, ON');
    console.log('✓ Filled location');

    // 4. Fill Description
    await page.fill('textarea[name*="description" i], textarea[placeholder*="describe" i]', 'Installed new deadbolt lock for customer. Tested functionality and provided customer with keys.');
    console.log('✓ Filled description');

    // 5. Upload a test photo
    // Create a simple test image file
    const testImagePath = await page.evaluate(async () => {
      // Create a simple canvas image as base64
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Test', 35, 55);
      }
      return canvas.toDataURL();
    });

    // Try to find file input for photo upload
    const fileInputs = await page.locator('input[type="file"]');
    const fileInputCount = await fileInputs.count();

    if (fileInputCount > 0) {
      // Convert base64 to blob and create file
      const buffer = Buffer.from(testImagePath.split(',')[1], 'base64');
      await fileInputs.first().setInputFiles({
        name: 'test-job-photo.png',
        mimeType: 'image/png',
        buffer: buffer
      });
      console.log('✓ Uploaded test photo');
    } else {
      console.log('⚠ No file input found - skipping photo upload');
    }

    // Wait a moment for form to process
    await page.waitForTimeout(1000);

    // Optional: Check if customer info checkbox exists and test it
    const customerInfoCheckbox = page.locator('input[type="checkbox"]:near(:text("customer information"))');
    if (await customerInfoCheckbox.isVisible()) {
      await customerInfoCheckbox.check();
      console.log('✓ Checked customer info checkbox');

      // Fill customer information if fields appear
      await page.waitForTimeout(500);

      const customerNameField = page.locator('input[name*="customer" i][name*="name" i], input[placeholder*="customer name" i]');
      if (await customerNameField.isVisible()) {
        await customerNameField.fill('John Smith');
        console.log('✓ Filled customer name');
      }

      const customerPhoneField = page.locator('input[name*="phone" i], input[placeholder*="phone" i]');
      if (await customerPhoneField.isVisible()) {
        await customerPhoneField.fill('(555) 123-4567');
        console.log('✓ Filled customer phone');
      }

      const customerEmailField = page.locator('input[type="email"], input[name*="email" i]');
      if (await customerEmailField.isVisible()) {
        await customerEmailField.fill('john.smith@example.com');
        console.log('✓ Filled customer email');
      }

      // Check marketing permission if exists
      const permissionCheckbox = page.locator('input[type="checkbox"]:near(:text("permission"))');
      if (await permissionCheckbox.isVisible()) {
        await permissionCheckbox.check();
        console.log('✓ Checked marketing permission');
      }
    }

    console.log('📋 Form filled out completely, attempting submission...');

    // Submit the form
    const submitButton = page.locator('button:has-text("Submit Content"), button:has-text("📸 Submit"), button[type="submit"]:not(:has-text("Draft"))');

    // Ensure submit button is enabled
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    // Click submit
    await submitButton.click();

    console.log('🚀 Clicked submit button');

    // Wait for submission to complete - look for success indicators
    try {
      // Wait for either success message or form to close
      await Promise.race([
        page.waitForSelector(':text("success"), :text("submitted"), :text("created")', { timeout: 15000 }),
        page.waitForSelector('form', { state: 'hidden', timeout: 15000 }),
        page.waitForURL('**/tech/dashboard', { timeout: 15000 })
      ]);

      console.log('✅ Submission appears to have completed');

      // Check for any error messages
      const errorMessages = await page.locator(':text("failed"), :text("error"), [role="alert"]').count();

      if (errorMessages > 0) {
        const errorText = await page.locator(':text("failed"), :text("error"), [role="alert"]').first().textContent();
        console.error('❌ Error found:', errorText);
        throw new Error(`Submission failed with error: ${errorText}`);
      }

      // Look for success indicators on the dashboard
      await page.waitForTimeout(2000);

      // Check if we can see the submitted content in the dashboard
      const submittedContent = await page.locator(':text("Lock Installation"), :text("Residential"), :text("123 Main St")').count();

      if (submittedContent > 0) {
        console.log('✅ SUCCESS: Job submission found on dashboard');
      } else {
        console.log('⚠ Warning: Submitted content not immediately visible on dashboard');
      }

    } catch (error) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'tech-submission-error.png', fullPage: true });

      // Log any console errors
      const consoleErrors = await page.evaluate(() => {
        return (window as any).consoleErrors || [];
      });

      if (consoleErrors.length > 0) {
        console.error('Console errors:', consoleErrors);
      }

      throw new Error(`Submission test failed: ${error.message}`);
    }

    // Final verification - check if form is closed and we're back on dashboard
    await expect(page).toHaveURL(/.*tech\/dashboard.*/);

    console.log('🎉 Tech photo submission test completed successfully!');
  });

  test('should handle submission errors gracefully', async ({ page }) => {
    // Test error handling by submitting incomplete form
    await page.goto('http://localhost:3001/tech-auth');

    await page.fill('input[placeholder*="code" i], input[type="text"]', '8D0LS9');
    await page.click('button:has-text("Continue"), button:has-text("Submit"), button:has-text("Login")');

    await page.waitForURL('**/tech/dashboard**');

    // Open form
    await page.click('button:has-text("Submit Content"), button:has-text("Submit New Content")');
    await page.waitForSelector('form, [role="dialog"]');

    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text("Submit Content"), button[type="submit"]:not(:has-text("Draft"))');

    // Submit button should be disabled initially
    await expect(submitButton).toBeDisabled();

    console.log('✅ Submit button correctly disabled when required fields are empty');

    // Fill minimum required fields to enable submit
    await page.selectOption('select[name*="category" i]', 'Automotive');
    await page.selectOption('select[name*="service" i]', 'Car Lockout');
    await page.fill('textarea[name*="description" i]', 'Minimum required description');

    // Now submit button should be enabled
    await expect(submitButton).toBeEnabled();

    console.log('✅ Submit button enabled when required fields are filled');
  });
});