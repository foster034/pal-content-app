import { test, expect } from '@playwright/test';

test('test fixed tech photo submission', async ({ page }) => {
  console.log('🚀 Starting tech photo submission test with corrected technician ID');

  // Set tech session directly to bypass auth
  await page.goto('http://localhost:3001/tech-auth');

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

  // Navigate to dashboard
  await page.goto('http://localhost:3001/tech/dashboard');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/.*tech\/dashboard.*/);

  console.log('✅ Tech logged in successfully');

  // Click Submit Content button
  await page.click('button:has-text("Submit Content"), button:has-text("Submit New Content"), button:has-text("+ Submit Content")');

  // Wait for form to appear
  await page.waitForSelector('form, [role="dialog"]', { timeout: 10000 });
  console.log('✅ Form opened');

  // Fill minimum required fields
  await page.selectOption('select[name*="category" i], select:near(:text("Category"))', 'Residential');
  console.log('✅ Selected category: Residential');

  // Wait for service dropdown to be populated
  await page.waitForTimeout(1000);
  await page.selectOption('select[name*="service" i], select:near(:text("Service"))', 'Lock Installation');
  console.log('✅ Selected service: Lock Installation');

  await page.fill('input[name*="location" i], input[placeholder*="location" i]', '123 Test St, Toronto');
  console.log('✅ Filled location');

  await page.fill('textarea[name*="description" i], textarea[placeholder*="describe" i]', 'Test job submission with corrected technician ID');
  console.log('✅ Filled description');

  // Try to submit
  const submitButton = page.locator('button:has-text("Submit Content"), button:has-text("📸 Submit"), button[type="submit"]:not(:has-text("Draft"))');
  await expect(submitButton).toBeEnabled({ timeout: 5000 });

  console.log('🚀 Submitting form...');
  await submitButton.click();

  // Wait for submission to complete
  try {
    await Promise.race([
      page.waitForSelector(':text("success"), :text("submitted"), :text("created")', { timeout: 10000 }),
      page.waitForSelector('form', { state: 'hidden', timeout: 10000 }),
      page.waitForURL('**/tech/dashboard', { timeout: 10000 })
    ]);

    console.log('✅ Form submission completed successfully');

    // Check for any error messages
    const errorMessages = await page.locator(':text("failed"), :text("error"), [role="alert"]').count();

    if (errorMessages > 0) {
      const errorText = await page.locator(':text("failed"), :text("error"), [role="alert"]').first().textContent();
      console.error('❌ Error found:', errorText);
      throw new Error(`Submission failed with error: ${errorText}`);
    }

    console.log('🎉 SUCCESS: Tech photo submission test passed!');

  } catch (error) {
    await page.screenshot({ path: 'tech-submission-fixed-test-error.png', fullPage: true });
    console.error('❌ Test failed:', error.message);
    throw error;
  }
});