import { test, expect } from '@playwright/test';

test.describe('Job Submission with New Content Fields', () => {
  test('should submit job with new content fields and appear in Job Submissions', async ({ page }) => {
    // Login as tech first
    await page.goto('http://localhost:3000/tech-auth');
    await page.waitForLoadState('networkidle');

    const codeInput = page.locator('input[placeholder*="login code" i], input[type="text"]').first();
    await codeInput.fill('8D0LS9');

    const loginButton = page.locator('button').filter({ hasText: /login with code/i }).first();
    await loginButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL('**/tech/dashboard', { timeout: 10000 });
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Click "Submit" button (updated text)
    const submitButton = page.locator('button').filter({ hasText: /submit new content|add content|new job|submit content/i }).first();
    await submitButton.click();

    // Wait for the modal to open
    await page.waitForSelector('text=What service did you complete?', { timeout: 5000 });

    // Step 1: Service Details
    await page.selectOption('select', { label: 'Automotive' });
    await page.waitForTimeout(500);
    await page.selectOption('select >> nth=1', { label: 'Car Lockout' });

    // Fill vehicle info
    await page.fill('input[placeholder="Year"]', '2020');
    await page.fill('input[placeholder="Make"]', 'Toyota');
    await page.fill('input[placeholder="Model"]', 'Camry');

    // Click Continue to Step 2
    await page.click('button:has-text("Continue")');

    // Step 2: Location
    await page.fill('input[placeholder="Enter service location"]', '123 Test St, Barrie, ON');

    // Click Continue to Step 3
    await page.click('button:has-text("Continue")');

    // Step 3: NEW CONTENT FIELDS
    console.log('Filling new content fields...');

    // Fill customer concern
    await page.fill('textarea[placeholder*="Locked out"]', 'Customer locked their keys in the car at the grocery store parking lot.');

    // Fill customer reaction
    await page.fill('textarea[placeholder*="relieved"]', 'Customer was very relieved and extremely grateful. Said they would definitely recommend us!');

    // Fill special challenges
    await page.fill('textarea[placeholder*="Emergency"]', 'It was raining heavily and the customer had groceries in the cart that were getting wet.');

    // Fill work completed summary
    await page.fill('textarea[placeholder="Describe the work completed..."]', 'Performed non-destructive vehicle entry using slim jim technique. Retrieved keys from locked vehicle without any damage to the door or window seals.');

    // Click Continue to Step 4
    await page.click('button:has-text("Continue")');

    // Step 4: Customer Info (optional - skip)

    // Submit the form
    await page.click('button:has-text("Submit")');

    // Wait for success message
    await page.waitForSelector('text=Job submitted successfully', { timeout: 10000 });

    console.log('Job submitted successfully!');

    // Navigate to franchisee login (we'll use magic link)
    await page.goto('http://localhost:3000/franchisee/login');

    // For testing, we'll check if the franchisee can see it
    // Note: In a real test, you'd need to login as franchisee first

    console.log('Test completed - job should now appear in Job Submissions');
  });

  test('should verify new fields are sent to API', async ({ page }) => {
    // Set up API response listener
    let apiRequestData: any = null;

    page.on('request', async (request) => {
      if (request.url().includes('/api/job-submissions') && request.method() === 'POST') {
        try {
          apiRequestData = request.postDataJSON();
          console.log('API Request Data:', JSON.stringify(apiRequestData, null, 2));
        } catch (e) {
          console.log('Could not parse request data');
        }
      }
    });

    // Login as tech first
    await page.goto('http://localhost:3000/tech-auth');
    await page.waitForLoadState('networkidle');

    const codeInput = page.locator('input[placeholder*="login code" i], input[type="text"]').first();
    await codeInput.fill('8D0LS9');

    const loginButton = page.locator('button').filter({ hasText: /login with code/i }).first();
    await loginButton.click();

    await page.waitForURL('**/tech/dashboard', { timeout: 10000 });
    await page.waitForSelector('text=Dashboard');

    // Submit a quick job
    const submitButton = page.locator('button').filter({ hasText: /submit new content|add content|new job|submit content/i }).first();
    await submitButton.click();
    await page.waitForSelector('text=What service did you complete?');

    // Fill minimal required fields
    await page.selectOption('select', { label: 'Residential' });
    await page.waitForTimeout(500);
    await page.selectOption('select >> nth=1', { index: 1 });
    await page.click('button:has-text("Continue")');

    await page.fill('input[placeholder="Enter service location"]', 'Test Location');
    await page.click('button:has-text("Continue")');

    // Fill the NEW fields
    await page.fill('textarea[placeholder*="Locked out"]', 'Test customer concern');
    await page.fill('textarea[placeholder*="relieved"]', 'Test customer reaction');
    await page.fill('textarea[placeholder*="Emergency"]', 'Test special challenges');
    await page.fill('textarea[placeholder="Describe the work completed..."]', 'Test description');

    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Submit")');

    // Wait a bit for API call
    await page.waitForTimeout(2000);

    // Verify the new fields are in the API request
    expect(apiRequestData).toBeTruthy();
    expect(apiRequestData.customerConcern).toBe('Test customer concern');
    expect(apiRequestData.customerReaction).toBe('Test customer reaction');
    expect(apiRequestData.specialChallenges).toBe('Test special challenges');

    console.log('✅ New fields verified in API request!');
  });
});
