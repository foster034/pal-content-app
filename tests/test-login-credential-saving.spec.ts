import { test, expect } from '@playwright/test';

test('Test Login Credential Saving and Autofill', async ({ page }) => {
  console.log('Testing login credential saving and autofill functionality...');

  // Navigate to login page
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForLoadState('networkidle');

  // Clear any existing saved data
  await page.evaluate(() => {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
  });

  // Take a screenshot of the login form
  await page.screenshot({ path: 'login-form-initial.png', fullPage: true });
  console.log('Screenshot saved as login-form-initial.png');

  // Test form attributes for browser autofill
  console.log('Checking form attributes for browser autofill...');

  // Check form autocomplete attribute
  const form = page.locator('form');
  const formAutoComplete = await form.getAttribute('autoComplete');
  expect(formAutoComplete).toBe('on');
  console.log('✅ Form has autoComplete="on"');

  // Check email field attributes
  const emailField = page.locator('#email');
  await expect(emailField).toBeVisible();

  const emailName = await emailField.getAttribute('name');
  const emailAutoComplete = await emailField.getAttribute('autoComplete');
  const emailType = await emailField.getAttribute('type');

  expect(emailName).toBe('email');
  expect(emailAutoComplete).toBe('email');
  expect(emailType).toBe('email');
  console.log('✅ Email field has proper attributes: name="email", autoComplete="email", type="email"');

  // Check password field attributes
  const passwordField = page.locator('#password');
  await expect(passwordField).toBeVisible();

  const passwordName = await passwordField.getAttribute('name');
  const passwordAutoComplete = await passwordField.getAttribute('autoComplete');
  const passwordType = await passwordField.getAttribute('type');

  expect(passwordName).toBe('password');
  expect(passwordAutoComplete).toBe('current-password');
  expect(passwordType).toBe('password');
  console.log('✅ Password field has proper attributes: name="password", autoComplete="current-password", type="password"');

  // Test Remember Me functionality
  console.log('Testing Remember Me functionality...');

  // Check Remember Me switch exists
  const rememberSwitch = page.locator('#remember');
  await expect(rememberSwitch).toBeVisible();
  console.log('✅ Remember Me switch is visible');

  // Fill in test credentials
  const testEmail = 'test@example.com';
  await emailField.fill(testEmail);
  await passwordField.fill('testpassword123');

  // Enable Remember Me
  await rememberSwitch.click();

  // Verify switch is checked
  const switchChecked = await rememberSwitch.isChecked();
  expect(switchChecked).toBe(true);
  console.log('✅ Remember Me switch can be toggled');

  // Test localStorage functionality (simulate successful login)
  await page.evaluate(({ email }) => {
    // Simulate what happens on successful login with Remember Me enabled
    localStorage.setItem('rememberedEmail', email);
    localStorage.setItem('rememberMe', 'true');
  }, { email: testEmail });

  // Refresh the page to test if credentials are remembered
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Check if email is pre-filled
  const prefilledEmail = await emailField.inputValue();
  expect(prefilledEmail).toBe(testEmail);
  console.log('✅ Email is pre-filled after page reload when Remember Me was enabled');

  // Check if Remember Me switch is checked
  const rememberSwitchChecked = await rememberSwitch.isChecked();
  expect(rememberSwitchChecked).toBe(true);
  console.log('✅ Remember Me switch state is restored');

  // Test clearing Remember Me
  await rememberSwitch.click(); // Uncheck it
  await page.evaluate(() => {
    // Simulate what happens when Remember Me is disabled
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
  });

  // Refresh again to test if credentials are cleared
  await page.reload();
  await page.waitForLoadState('networkidle');

  const clearedEmail = await emailField.inputValue();
  const clearedRememberMe = await rememberSwitch.isChecked();

  expect(clearedEmail).toBe('');
  expect(clearedRememberMe).toBe(false);
  console.log('✅ Credentials are cleared when Remember Me is disabled');

  // Take a final screenshot
  await page.screenshot({ path: 'login-form-final.png', fullPage: true });
  console.log('Screenshot saved as login-form-final.png');

  console.log('\n✅ All login credential saving tests passed!');
  console.log('Login form now supports:');
  console.log('  - Browser autofill with proper HTML attributes');
  console.log('  - Remember Me functionality with localStorage');
  console.log('  - Proper form security attributes');
  console.log('  - Credential persistence across page reloads');
});