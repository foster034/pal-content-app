import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test('Test admin login flow', async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // First, try to log in directly via Supabase to check if it works
  console.log('Testing direct Supabase login...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@test.ca',
    password: 'test123456'
  });

  if (authError) {
    console.log('Direct login error:', authError.message);

    // The user might need email confirmation, let's try to update them to confirmed
    // This requires admin access, so we'll need to use service role key
    console.log('User may need email confirmation or password reset');
  } else {
    console.log('Direct login successful!');
    console.log('User ID:', authData.user?.id);
    console.log('User email:', authData.user?.email);

    // Check their role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user?.id)
      .single();

    console.log('User role in profiles:', profile?.role);
  }

  // Now test the actual UI login
  console.log('\nTesting UI login...');
  await page.goto('http://localhost:3000/auth/login');

  // Wait for the page to be ready
  await page.waitForSelector('input[type="email"]');

  // Fill in login credentials
  await page.fill('input[type="email"]', 'admin@test.ca');
  await page.fill('input[type="password"]', 'test123456');

  // Click the login button
  await page.click('button:has-text("Log in")');

  // Wait for either redirect or error
  await page.waitForTimeout(5000);

  // Check where we ended up
  const currentUrl = page.url();
  console.log('Current URL after UI login:', currentUrl);

  // Take a screenshot
  await page.screenshot({ path: 'admin-login-test-result.png', fullPage: true });

  // Check if we're on the tech-auth page
  if (currentUrl.includes('tech-auth')) {
    console.log('ERROR: Redirected to tech-auth instead of admin!');

    // Check if we're logged in at all
    const hasTechLogin = await page.locator('text="Technician Login"').count();
    console.log('Shows Technician Login form:', hasTechLogin > 0);
  } else if (currentUrl.includes('admin')) {
    console.log('SUCCESS: Correctly redirected to admin dashboard');
  } else if (currentUrl.includes('auth/login')) {
    console.log('Still on login page - check for error messages');

    const errorText = await page.locator('[role="alert"]').textContent().catch(() => null);
    if (errorText) {
      console.log('Login error message:', errorText);
    }
  }
});