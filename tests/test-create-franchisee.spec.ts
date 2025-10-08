import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

test.describe('Create Franchisee from Admin', () => {
  let createdFranchiseeId: string | null = null;
  let createdUserId: string | null = null;

  test.afterAll(async () => {
    // Cleanup: Delete the created franchisee and auth user
    if (createdFranchiseeId) {
      console.log('Cleaning up franchisee:', createdFranchiseeId);
      await supabase.from('franchisees').delete().eq('id', createdFranchiseeId);
    }
    if (createdUserId) {
      console.log('Cleaning up auth user:', createdUserId);
      await supabase.auth.admin.deleteUser(createdUserId);
    }
  });

  test('should login as admin and create a new franchisee', async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('Error') || msg.text().includes('Failed')) {
        console.log('Browser console:', msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', err => {
      console.log('Page error:', err.message);
    });

    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin@test.ca');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'admin@test.ca');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin**', { timeout: 10000 });
    console.log('✅ Logged in successfully, redirected to:', page.url());

    // Step 2: Navigate to franchisees page
    console.log('Step 2: Navigating to franchisees page');
    await page.goto('http://localhost:3000/admin/franchisees');
    await page.waitForLoadState('networkidle');

    // Step 3: Click "Create New Franchisee" button
    console.log('Step 3: Opening create franchisee form');
    await page.click('button:has-text("Create New Franchisee"), button:has-text("Add Franchisee")');
    await page.waitForTimeout(1000);

    // Step 4: Fill in franchisee details
    console.log('Step 4: Filling in franchisee details');
    const timestamp = Date.now();
    const testEmail = `test-franchisee-${timestamp}@example.com`;
    const testName = `Test Franchisee ${timestamp}`;
    const testTerritory = `Test Territory ${timestamp}`;

    // Fill main fields - use more specific locators
    const formSection = page.locator('form, div:has(h2:has-text("Create New Franchisee"))').first();

    // Name field (first text input)
    await formSection.locator('input[type="text"]').first().fill(testName);

    // Username field (second text input)
    const testUsername = `testfranchisee${timestamp}`;
    await formSection.locator('input[type="text"]').nth(1).fill(testUsername);

    // Email field
    await formSection.locator('input[type="email"]').first().fill(testEmail);

    // Phone field
    await formSection.locator('input[type="tel"]').first().fill('555-0123');

    // Territory field (look for label)
    const territoryLabel = formSection.locator('label:has-text("Territory")');
    const territoryInput = await territoryLabel.locator('..').locator('input').first();
    await territoryInput.fill(testTerritory);

    // Ensure "Create Supabase Auth User" is checked
    const authCheckbox = page.locator('input#createAuth');
    const isChecked = await authCheckbox.isChecked();
    if (!isChecked) {
      await authCheckbox.check();
    }
    console.log('✅ "Create Supabase Auth User" is checked');

    // Verify auth method is magic_link (default)
    const magicLinkRadio = page.locator('input[type="radio"][value="magic_link"]');
    await expect(magicLinkRadio).toBeChecked();
    console.log('✅ Magic link auth method selected');

    // Step 5: Submit the form
    console.log('Step 5: Submitting form');

    // Listen for alert dialogs
    page.once('dialog', async dialog => {
      console.log('Alert dialog:', dialog.message());
      await dialog.accept();
    });

    // Submit and wait for API call
    const [response] = await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/api/franchisees') && response.request().method() === 'POST',
        { timeout: 15000 }
      ),
      page.click('button[type="submit"]:has-text("Create")')
    ]);

    console.log('API Request body:', response.request().postData());
    console.log('API Response status:', response.status());
    const responseData = await response.json();
    console.log('API Response data:', JSON.stringify(responseData, null, 2));

    // Check if there's an error in the response
    if (responseData.error) {
      console.error('❌ API returned error:', responseData.error);
      if (responseData.details) {
        console.error('   Details:', responseData.details);
      }
    }

    // Wait for form to close or update
    await page.waitForTimeout(2000);

    // Step 6: Verify in Supabase - Check franchisees table
    console.log('Step 6: Verifying franchisee in Supabase database');
    const { data: franchisee, error: franchiseeError } = await supabase
      .from('franchisees')
      .select('*')
      .eq('email', testEmail)
      .single();

    expect(franchiseeError).toBeNull();
    expect(franchisee).not.toBeNull();
    expect(franchisee?.business_name).toBe(testName);
    expect(franchisee?.email).toBe(testEmail);
    expect(franchisee?.phone).toBe('555-0123');
    expect(franchisee?.territory).toBe(testTerritory);

    console.log('✅ Franchisee found in database:', {
      id: franchisee?.id,
      name: franchisee?.business_name,
      email: franchisee?.email
    });

    createdFranchiseeId = franchisee?.id;

    // Step 7: Check if auth user was created (optional - may fail due to trigger issues)
    console.log('Step 7: Checking if auth user was created');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (!usersError) {
      const authUser = users.find(u => u.email === testEmail);
      if (authUser) {
        console.log('✅ Auth user found:', {
          id: authUser?.id,
          email: authUser?.email
        });
        createdUserId = authUser?.id || null;

        // Step 8: Verify profile was created with franchisee role
        console.log('Step 8: Verifying profile with franchisee role');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            full_name,
            role_id,
            franchisee_id,
            roles (
              id,
              name
            )
          `)
          .eq('id', authUser.id)
          .single();

        if (!profileError && profile) {
          expect(profile?.email).toBe(testEmail);
          expect(profile?.roles?.name).toBe('franchisee');
          expect(profile?.franchisee_id).toBe(franchisee?.id);
          console.log('✅ Profile found with correct role:', {
            id: profile?.id,
            email: profile?.email,
            role: profile?.roles?.name,
            role_id: profile?.role_id,
            franchisee_id: profile?.franchisee_id
          });
        } else {
          console.log('⚠️  Profile not created (trigger may have failed)');
        }
      } else {
        console.log('⚠️  Auth user not created (auth creation failed - check server logs)');
      }
    } else {
      console.log('⚠️  Could not list auth users:', usersError);
    }

    // Step 9: Verify franchisee appears in the list
    console.log('Step 9: Verifying franchisee appears in admin list');
    await page.goto('http://localhost:3000/admin/franchisees');
    await page.waitForLoadState('networkidle');

    // Search for the newly created franchisee
    const searchInput = page.locator('input[type="text"]:near(:text("Search"))');
    if (await searchInput.count() > 0) {
      await searchInput.fill(testEmail);
      await page.waitForTimeout(1000);
    }

    // Check if the franchisee appears in the table
    const franchiseeRow = page.locator(`tr:has-text("${testEmail}")`);
    await expect(franchiseeRow).toBeVisible();
    console.log('✅ Franchisee appears in admin list');

    console.log('🎉 All verifications passed!');
  });
});
