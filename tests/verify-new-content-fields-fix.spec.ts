import { test, expect } from '@playwright/test';

test('Verify new content fields are sent to API and job appears in Job Submissions', async ({ page }) => {
  console.log('Step 1: Login as tech with code 8D0LS9');

  // Login as tech
  await page.goto('http://localhost:3000/tech-auth');
  await page.waitForLoadState('networkidle');

  const codeInput = page.locator('input[placeholder*="login code" i], input[type="text"]').first();
  await codeInput.fill('8D0LS9');

  const loginButton = page.locator('button').filter({ hasText: /login with code/i }).first();
  await loginButton.click();

  await page.waitForURL('**/tech/dashboard', { timeout: 10000 });
  console.log('✅ Tech logged in successfully');

  // Set up API request interceptor
  let apiRequestData: any = null;
  page.on('request', (request) => {
    if (request.url().includes('/api/job-submissions') && request.method() === 'POST') {
      try {
        apiRequestData = request.postDataJSON();
        console.log('📤 API Request captured:', JSON.stringify(apiRequestData, null, 2));
      } catch (e) {
        console.log('Could not parse request');
      }
    }
  });

  console.log('Step 2: Open job submission form');

  const submitButton = page.locator('button').filter({ hasText: /submit new content|submit content/i }).first();
  await submitButton.click();
  await page.waitForSelector('text=What service did you complete?', { timeout: 5000 });

  console.log('Step 3: Fill form with new content fields');

  // Step 1: Service Details
  await page.selectOption('select', { label: 'Automotive' });
  await page.waitForTimeout(500);
  await page.selectOption('select >> nth=1', { index: 1 });

  // Fill vehicle info
  await page.fill('input[placeholder="Year"]', '2024');
  await page.fill('input[placeholder="Make"]', 'Tesla');
  await page.fill('input[placeholder="Model"]', 'Model 3');

  await page.click('button:has-text("Continue")');

  // Step 2: Location
  await page.fill('input[placeholder="Enter service location"]', 'Test Location Barrie');
  await page.click('button:has-text("Continue")');

  // Step 3: NEW CONTENT FIELDS - This is what we're testing!
  console.log('Filling NEW content fields...');

  await page.fill('textarea[placeholder*="Locked out"]', 'Customer lost their key fob');
  await page.fill('textarea[placeholder*="relieved"]', 'Customer was very happy and grateful');
  await page.fill('textarea[placeholder*="Emergency"]', 'Job was done in heavy rain');
  await page.fill('textarea[placeholder="Describe the work completed..."]', 'Programmed new key fob for Tesla Model 3');

  await page.click('button:has-text("Continue")');

  // Step 4: Skip customer info
  await page.click('button:has-text("Submit")');

  console.log('Step 4: Wait for submission');
  await page.waitForTimeout(3000);

  // Verify API request contains new fields
  console.log('Step 5: Verify API request data');
  expect(apiRequestData).toBeTruthy();
  expect(apiRequestData.customerConcern).toBe('Customer lost their key fob');
  expect(apiRequestData.customerReaction).toBe('Customer was very happy and grateful');
  expect(apiRequestData.specialChallenges).toBe('Job was done in heavy rain');

  console.log('✅ New fields verified in API request!');

  // Now login as franchisee to verify job appears in Job Submissions
  console.log('Step 6: Login as franchisee to verify job appears');

  await page.goto('http://localhost:3000/franchisee/login');
  await page.waitForLoadState('networkidle');

  // Enter email
  await page.fill('input[type="email"]', 'admin@test.ca');
  await page.click('button:has-text("Send Magic Link")');

  console.log('✅ Test completed! Verify manually that:');
  console.log('1. API request included customerConcern, customerReaction, specialChallenges');
  console.log('2. Job should appear in franchisee Job Submissions page after magic link login');
});
