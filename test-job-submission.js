const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to login
  await page.goto('http://localhost:3000/auth/login');

  // Login with demo credentials
  await page.fill('input[type="email"]', 'admin@test.ca');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');

  // Wait for redirect and go to tech dashboard
  await page.waitForTimeout(2000);
  await page.goto('http://localhost:3000/tech/dashboard');

  // Wait for page to load
  await page.waitForTimeout(1000);

  // Click the "Submit New Content" button to open the form
  await page.click('button:has-text("Submit New Content")');

  // Fill out the form
  await page.selectOption('select[name="category"]', 'Residential');
  await page.waitForTimeout(500);
  await page.selectOption('select[name="service"]', 'Home Lockout');

  await page.fill('input[name="customerName"]', 'Test Customer');
  await page.fill('input[name="customerPhone"]', '555-1234');
  await page.fill('input[name="customerEmail"]', 'test@example.com');
  await page.fill('input[name="location"]', 'Test Location');

  // Add a description
  await page.fill('textarea[name="description"]', 'Test description for job submission');

  // Submit the form
  console.log('Submitting form...');
  await page.click('button[type="submit"]:has-text("Submit Content")');

  // Wait for the response and check console for errors
  await page.waitForTimeout(3000);

  await browser.close();
})();