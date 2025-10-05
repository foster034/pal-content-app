import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'brentfoster.popalock@gmail.com';
const ADMIN_PASSWORD = 'B69706034';
const VALID_TECH_CODE = 'FMOQY2'; // Rachel's code from database

test.describe('Photo Management and End-to-End Workflow Tests', () => {

  test('Complete tech workflow: login → dashboard → job submission flow', async ({ page }) => {
    console.log('🔄 Testing complete tech workflow...');

    // Step 1: Tech login with valid code
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Tech Code")');
    await page.fill('input[name="techCode"]', VALID_TECH_CODE);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL('**/tech/dashboard**', { timeout: 15000 });
    await expect(page.url()).toContain('/tech/dashboard');
    console.log('✅ Tech login successful');

    // Step 2: Verify tech dashboard elements
    await expect(page.locator('h1, h2')).toContainText(/dashboard/i);
    console.log('✅ Tech dashboard loaded');

    // Step 3: Test job submission interface
    const submitJobButton = page.locator('button:has-text("Submit Job")');
    if (await submitJobButton.isVisible()) {
      await submitJobButton.click();

      // Check if modal opens
      await expect(page.locator('text=Submit Job')).toBeVisible({ timeout: 5000 });
      console.log('✅ Job submission modal opened');

      // Close modal to continue
      const closeButton = page.locator('button:has-text("Cancel"), button[aria-label="Close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    } else {
      console.log('ℹ️ Job submission button not found on dashboard');
    }

    // Step 4: Navigate to tech photos page
    await page.goto(`${BASE_URL}/tech/photos`);
    await expect(page.url()).toContain('/tech/photos');
    console.log('✅ Tech photos page accessible');

    // Step 5: Test photo upload interface
    const fileInputs = page.locator('input[type="file"]');
    const fileInputCount = await fileInputs.count();

    if (fileInputCount > 0) {
      console.log(`✅ Found ${fileInputCount} file upload interface(s)`);
    } else {
      console.log('ℹ️ No file upload interfaces found - may be job-specific');
    }

    // Step 6: Navigate to tech profile
    await page.goto(`${BASE_URL}/tech/profile`);
    await expect(page.url()).toContain('/tech/profile');
    console.log('✅ Tech profile page accessible');

    console.log('✅ Complete tech workflow test successful');
  });

  test('Admin photo review and management workflow', async ({ page }) => {
    console.log('👨‍💼 Testing admin photo management workflow...');

    // Step 1: Admin login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**', { timeout: 15000 });

    // Step 2: Navigate to marketing section (likely has photo management)
    await page.goto(`${BASE_URL}/admin/marketing`);
    await expect(page.url()).toContain('/admin/marketing');
    console.log('✅ Admin marketing page accessible');

    // Step 3: Look for photo management elements
    const photoElements = page.locator('img, [src*="photo"], [alt*="photo"], text=/photo/i');
    const photoCount = await photoElements.count();

    if (photoCount > 0) {
      console.log(`✅ Found ${photoCount} photo-related elements`);
    } else {
      console.log('ℹ️ No photo elements found on marketing page');
    }

    // Step 4: Test media archive if available
    const mediaArchiveLink = page.locator('a:has-text("Media Archive"), button:has-text("Media Archive")');
    if (await mediaArchiveLink.isVisible()) {
      await mediaArchiveLink.click();
      console.log('✅ Media archive accessible');
    }

    console.log('✅ Admin photo management workflow test complete');
  });

  test('Franchisee photo review workflow', async ({ page }) => {
    console.log('🏢 Testing franchisee photo review workflow...');

    // Navigate to franchisee photos page
    await page.goto(`${BASE_URL}/franchisee/photos`);

    // Check if authentication required
    if (page.url().includes('auth') || page.url().includes('login')) {
      console.log('✅ Franchisee photos requires authentication (expected)');

      // Try to access with admin credentials (to test functionality)
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[name="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin**');

      // Try franchisee page again
      await page.goto(`${BASE_URL}/franchisee/photos`);
    }

    if (page.url().includes('/franchisee/photos')) {
      console.log('✅ Franchisee photos page accessible');

      // Look for photo management elements
      const approveButtons = page.locator('button:has-text("Approve")');
      const denyButtons = page.locator('button:has-text("Deny")');

      const approveCount = await approveButtons.count();
      const denyCount = await denyButtons.count();

      console.log(`Found ${approveCount} approve buttons and ${denyCount} deny buttons`);
    }

    console.log('✅ Franchisee photo review workflow test complete');
  });

  test('Photo API endpoints comprehensive testing', async ({ page }) => {
    console.log('🔌 Testing photo-related API endpoints...');

    // Test franchisee photos API with various parameters
    const apiTests = [
      { url: '/api/franchisee-photos', description: 'Get all photos' },
      { url: '/api/franchisee-photos?technicianId=test', description: 'Filter by technician' },
      { url: '/api/job-submissions', description: 'Get job submissions' },
      { url: '/api/tech-auth', description: 'Tech authentication endpoint' }
    ];

    for (const apiTest of apiTests) {
      const response = await page.request.get(`${BASE_URL}${apiTest.url}`);
      console.log(`${apiTest.description}: Status ${response.status()}`);

      if (response.status() === 200) {
        try {
          const data = await response.json();
          if (Array.isArray(data)) {
            console.log(`  ✅ Returned ${data.length} items`);
          } else {
            console.log(`  ✅ Returned valid JSON data`);
          }
        } catch (e) {
          console.log(`  ⚠️ Non-JSON response`);
        }
      }
    }

    // Test photo status update (PATCH)
    const updateResponse = await page.request.patch(`${BASE_URL}/api/franchisee-photos`, {
      data: {
        photoId: 'test-photo-id',
        status: 'approved',
        reviewNotes: 'Test approval'
      }
    });
    console.log(`Photo status update: Status ${updateResponse.status()}`);

    console.log('✅ Photo API endpoints testing complete');
  });

  test('AI report generation and photo analysis', async ({ page }) => {
    console.log('🤖 Testing AI report generation with photos...');

    // Test AI report generation endpoint
    const aiReportTests = [
      {
        url: '/api/generate-job-report',
        method: 'POST',
        data: { jobId: 'test-job', test: true },
        description: 'AI job report generation'
      },
      {
        url: '/api/update-job-ai-report',
        method: 'POST',
        data: { jobId: 'test-job', reportData: 'test' },
        description: 'AI report update'
      }
    ];

    for (const aiTest of aiReportTests) {
      try {
        const response = await page.request[aiTest.method.toLowerCase()](`${BASE_URL}${aiTest.url}`, {
          data: aiTest.data
        });
        console.log(`${aiTest.description}: Status ${response.status()}`);

        if (response.status() === 200) {
          console.log(`  ✅ AI endpoint responding correctly`);
        } else {
          console.log(`  ℹ️ AI endpoint requires specific data format or auth`);
        }
      } catch (error) {
        console.log(`  ⚠️ ${aiTest.description} not accessible: ${error.message}`);
      }
    }

    console.log('✅ AI report generation testing complete');
  });

  test('Storage bucket and file upload verification', async ({ page }) => {
    console.log('💾 Testing storage bucket functionality...');

    // Test tech photo upload interface
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Tech Code")');
    await page.fill('input[name="techCode"]', VALID_TECH_CODE);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tech/dashboard**');

    // Navigate to photos page
    await page.goto(`${BASE_URL}/tech/photos`);

    // Look for file upload capabilities
    const fileInputs = page.locator('input[type="file"]');
    const dropZones = page.locator('[data-testid="drop-zone"], .drop-zone, text=/drag.*drop/i');

    const fileInputCount = await fileInputs.count();
    const dropZoneCount = await dropZones.count();

    console.log(`Found ${fileInputCount} file inputs and ${dropZoneCount} drop zones`);

    if (fileInputCount > 0) {
      // Test file input accessibility
      const firstFileInput = fileInputs.first();
      await expect(firstFileInput).toBeVisible();
      console.log('✅ File upload interface accessible');
    }

    // Test if we can access the job submission with photo upload
    const submitButtons = page.locator('button:has-text("Submit"), button:has-text("Add Job")');
    const submitButtonCount = await submitButtons.count();

    if (submitButtonCount > 0) {
      await submitButtons.first().click();

      // Wait for modal/form to open
      await page.waitForTimeout(2000);

      // Look for photo upload in submission form
      const modalFileInputs = page.locator('input[type="file"]');
      const modalFileInputCount = await modalFileInputs.count();

      console.log(`Found ${modalFileInputCount} file inputs in submission form`);

      if (modalFileInputCount > 0) {
        console.log('✅ Photo upload available in job submission');
      }
    }

    console.log('✅ Storage bucket verification complete');
  });

  test('Database integration with photo metadata', async ({ page }) => {
    console.log('🗄️ Testing database integration for photo metadata...');

    // Test getting photos with metadata
    const photosResponse = await page.request.get(`${BASE_URL}/api/franchisee-photos`);

    if (photosResponse.status() === 200) {
      const photos = await photosResponse.json();
      console.log(`Retrieved ${photos.length} photos from database`);

      if (photos.length > 0) {
        const firstPhoto = photos[0];
        const expectedFields = [
          'id', 'photo_url', 'technician_id', 'status', 'created_at'
        ];

        const missingFields = expectedFields.filter(field => !(field in firstPhoto));
        const presentFields = expectedFields.filter(field => field in firstPhoto);

        console.log(`✅ Photo metadata fields present: ${presentFields.join(', ')}`);
        if (missingFields.length > 0) {
          console.log(`⚠️ Missing fields: ${missingFields.join(', ')}`);
        }

        // Check if photo URLs are valid
        if (firstPhoto.photo_url) {
          const photoUrlResponse = await page.request.head(firstPhoto.photo_url);
          console.log(`Photo URL accessibility: Status ${photoUrlResponse.status()}`);
        }
      }
    } else {
      console.log(`Photos API returned status: ${photosResponse.status()}`);
    }

    // Test job submissions with photo data
    const jobsResponse = await page.request.get(`${BASE_URL}/api/job-submissions`);

    if (jobsResponse.status() === 200) {
      const jobs = await jobsResponse.json();
      console.log(`Retrieved ${jobs.length} job submissions from database`);

      if (jobs.length > 0) {
        const jobsWithPhotos = jobs.filter(job =>
          job.before_photos?.length > 0 ||
          job.after_photos?.length > 0 ||
          job.process_photos?.length > 0
        );

        console.log(`✅ Jobs with photos: ${jobsWithPhotos.length}/${jobs.length}`);
      }
    }

    console.log('✅ Database integration testing complete');
  });

  test('Performance and load testing for photo workflows', async ({ page }) => {
    console.log('⚡ Testing performance of photo workflows...');

    // Test page load times
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/franchisee/photos`);
    const loadTime = Date.now() - startTime;

    console.log(`Franchisee photos page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);

    // Test API response times
    const apiStartTime = Date.now();
    const photosResponse = await page.request.get(`${BASE_URL}/api/franchisee-photos`);
    const apiTime = Date.now() - apiStartTime;

    console.log(`Photos API response time: ${apiTime}ms`);
    expect(apiTime).toBeLessThan(3000);

    // Test multiple concurrent API calls
    const concurrentCalls = Array(5).fill(0).map(() =>
      page.request.get(`${BASE_URL}/api/franchisee-photos`)
    );

    const concurrentStartTime = Date.now();
    const results = await Promise.all(concurrentCalls);
    const concurrentTime = Date.now() - concurrentStartTime;

    console.log(`5 concurrent API calls completed in: ${concurrentTime}ms`);
    expect(concurrentTime).toBeLessThan(10000);

    const successfulCalls = results.filter(r => r.status() === 200).length;
    console.log(`✅ ${successfulCalls}/5 concurrent calls successful`);

    console.log('✅ Performance testing complete');
  });

  test('Error handling and edge cases in photo workflows', async ({ page }) => {
    console.log('🛡️ Testing error handling in photo workflows...');

    // Test invalid photo ID update
    const invalidUpdateResponse = await page.request.patch(`${BASE_URL}/api/franchisee-photos`, {
      data: {
        photoId: 'nonexistent-photo-id',
        status: 'approved'
      }
    });

    console.log(`Invalid photo update: Status ${invalidUpdateResponse.status()}`);
    expect([400, 404, 500]).toContain(invalidUpdateResponse.status());

    // Test malformed data
    const malformedResponse = await page.request.patch(`${BASE_URL}/api/franchisee-photos`, {
      data: {
        // Missing required fields
        status: 'approved'
      }
    });

    console.log(`Malformed data request: Status ${malformedResponse.status()}`);
    expect([400, 422]).toContain(malformedResponse.status());

    // Test invalid tech code
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Tech Code")');
    await page.fill('input[name="techCode"]', 'INVALID');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid', 'text=error')).toBeVisible({ timeout: 5000 });
    console.log('✅ Invalid tech code properly handled');

    // Test accessing protected routes without auth
    await page.goto(`${BASE_URL}/tech/photos`);

    if (page.url().includes('auth') || page.url().includes('login')) {
      console.log('✅ Protected routes require authentication');
    }

    console.log('✅ Error handling testing complete');
  });
});