import { test, expect } from '@playwright/test';

test.describe('Technician Specialties Persistence', () => {
  test('should save and reload specialties after page refresh', async ({ page }) => {
    // Login as franchisee
    await page.goto('http://localhost:3000');

    // Click Tech Code tab
    await page.click('button:has-text("Tech Code")');
    await page.waitForTimeout(500);

    await page.fill('input[type="text"]', 'FMOQY2');
    await page.click('button:has-text("Enter Dashboard")');

    // Wait for navigation and go to techs page
    await page.waitForURL('**/franchisee/techs');

    // Click Add Technician button
    await page.click('button:has-text("Add Technician")');

    // Wait for modal to open
    await page.waitForSelector('text=Add New Technician');

    // Fill in technician details
    const timestamp = Date.now();
    await page.fill('input[name="name"]', `Test Tech ${timestamp}`);
    await page.fill('input[type="email"]', `testtech${timestamp}@example.com`);
    await page.fill('input[type="tel"]', '555-0123');

    // Add specialties
    await page.click('text=Select Specialties');
    await page.click('text=Automotive Locksmith');
    await page.click('text=Residential Locksmith');
    await page.click('text=Commercial Locksmith');

    // Click outside to close dropdown
    await page.click('text=Add New Technician');

    // Submit form
    await page.click('button:has-text("Add Technician")');

    // Wait for success message or table update
    await page.waitForTimeout(2000);

    // Verify tech appears in table with specialties
    await expect(page.locator(`text=Test Tech ${timestamp}`)).toBeVisible();

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click on the tech to view details
    await page.click(`text=Test Tech ${timestamp}`);
    await page.waitForTimeout(1000);

    // Verify specialties are still present after reload
    // Check if the specialties badges/chips are visible
    await expect(page.locator('text=Automotive Locksmith').first()).toBeVisible();
    await expect(page.locator('text=Residential Locksmith').first()).toBeVisible();
    await expect(page.locator('text=Commercial Locksmith').first()).toBeVisible();
  });

  test('should persist edited specialties after page refresh', async ({ page }) => {
    // Login as franchisee
    await page.goto('http://localhost:3000');

    // Click Tech Code tab
    await page.click('button:has-text("Tech Code")');
    await page.waitForTimeout(500);

    await page.fill('input[type="text"]', 'FMOQY2');
    await page.click('button:has-text("Enter Dashboard")');

    await page.waitForURL('**/franchisee/techs');

    // Find first technician and click edit
    await page.click('button[aria-label="Actions"]');
    await page.click('text=Edit Details');

    // Wait for edit modal
    await page.waitForSelector('text=Edit Technician');

    // Clear existing specialties and add new ones
    await page.click('text=Select Specialties');
    await page.click('text=Safe & Vault Services');
    await page.click('text=Emergency Services');

    // Close dropdown
    await page.click('text=Edit Technician');

    // Save changes
    await page.click('button:has-text("Save Changes")');
    await page.waitForTimeout(2000);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click on same tech to view details
    await page.click('button[aria-label="Actions"]');
    await page.click('text=Edit Details');

    // Verify new specialties are present
    await expect(page.locator('text=Safe & Vault Services').first()).toBeVisible();
    await expect(page.locator('text=Emergency Services').first()).toBeVisible();
  });
});
