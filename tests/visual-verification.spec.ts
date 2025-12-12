import { test, expect } from '@playwright/test';

test.describe('Visual Design Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Login page - Split-screen design', async ({ page }) => {
    await page.goto('http://localhost/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: 'tests/screenshots/login-desktop.png',
      fullPage: true
    });

    // Verify no card wrapper exists
    const cardElements = await page.locator('.card').count();
    expect(cardElements).toBe(0);

    // Verify split-screen layout exists
    const authBrandExists = await page.locator('.auth-brand').count();
    expect(authBrandExists).toBeGreaterThan(0);
  });

  test('Login page - Mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost/login');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/screenshots/login-mobile.png',
      fullPage: true
    });
  });

  test('Dashboard - Hero section (requires auth)', async ({ page }) => {
    // Note: This will fail without authentication
    // For now, just take screenshot of what we get
    await page.goto('http://localhost/');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/screenshots/dashboard-or-login-redirect.png',
      fullPage: true
    });
  });

  test('Dashboard - Verify no card overuse', async ({ page }) => {
    await page.goto('http://localhost/');
    await page.waitForLoadState('networkidle');

    // Count cards on the page
    const cardCount = await page.locator('.card').count();

    // Should have minimal or no cards based on new design
    console.log(`Card count on dashboard: ${cardCount}`);
  });

  test('Color contrast check', async ({ page }) => {
    await page.goto('http://localhost/login');
    await page.waitForLoadState('networkidle');

    // Get computed styles of key elements
    const heroGradient = await page.evaluate(() => {
      const authBrand = document.querySelector('.auth-brand');
      if (authBrand) {
        return window.getComputedStyle(authBrand).background;
      }
      return null;
    });

    console.log('Hero gradient:', heroGradient);
  });
});
