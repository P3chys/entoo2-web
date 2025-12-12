import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 900 });

    // Login with the user we registered earlier
    await page.goto('http://localhost/login');
    await page.waitForLoadState('networkidle');

    // Register a new user (since we don't know the previous one's password)
    await page.goto('http://localhost/register');
    await page.waitForLoadState('networkidle');

    const testEmail = `test${Date.now()}@example.com`;
    await page.fill('input[type="email"]', testEmail);
    await page.locator('input[type="password"]').first().fill('Test123456!');
    await page.locator('input[type="password"]').nth(1).fill('Test123456!');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('After register:', page.url());

    // Take screenshot of the redesigned dashboard
    await page.screenshot({ path: 'screenshot_dashboard_v2.png', fullPage: true });

    await browser.close();
    console.log('New dashboard screenshot saved!');
})();
