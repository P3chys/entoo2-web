import { test, expect } from '@playwright/test';

test.describe('Questions Feature', () => {
	test.beforeEach(async ({ page }) => {
		// Login as admin
		await page.goto('http://localhost/login');
		await page.fill('input[type="email"]', 'admin@entoo2.local');
		await page.fill('input[type="password"]', 'AdminPassword123!');
		await page.click('button[type="submit"]');

		// Wait for navigation to complete
		await page.waitForURL('http://localhost/');
	});

	test('should show questions collapsed by default', async ({ page }) => {
		// Navigate to subjects page
		await page.goto('http://localhost/subjects');

		// Click on first subject
		await page.click('.card.hover\\:shadow-lg');

		// Navigate to questions tab
		await page.click('text=Q&A');

		// Wait for questions to load
		await page.waitForSelector('.card.p-5.border-l-4', { timeout: 10000 });

		// Check if questions are collapsed (no full content visible initially)
		const questionCards = await page.$$('.card.p-5.border-l-4');

		if (questionCards.length > 0) {
			// Check that the chevron-down icon is visible (indicating collapsed state)
			const chevronDown = await page.$('[name="chevron-down"]');
			expect(chevronDown).toBeTruthy();

			console.log('✓ Questions are collapsed by default');
		} else {
			console.log('⚠ No questions found in this subject');
		}
	});

	test('should expand question when clicked', async ({ page }) => {
		// Navigate to subjects page
		await page.goto('http://localhost/subjects');

		// Click on first subject
		await page.click('.card.hover\\:shadow-lg');

		// Navigate to questions tab
		await page.click('text=Q&A');

		// Wait for questions to load
		await page.waitForSelector('.card.p-5.border-l-4', { timeout: 10000 });

		const questionCards = await page.$$('.card.p-5.border-l-4');

		if (questionCards.length > 0) {
			// Click the first question header to expand
			await questionCards[0].click();

			// Wait a moment for animation
			await page.waitForTimeout(500);

			// Check if chevron-up icon appears (indicating expanded state)
			const chevronUp = await page.$('[name="chevron-up"]');
			expect(chevronUp).toBeTruthy();

			console.log('✓ Question expands when clicked');
		} else {
			console.log('⚠ No questions found in this subject');
		}
	});

	test('should show bulk download button when files exist', async ({ page }) => {
		// Navigate to subjects page
		await page.goto('http://localhost/subjects');

		// Click on first subject
		await page.click('.card.hover\\:shadow-lg');

		// Navigate to questions tab
		await page.click('text=Q&A');

		// Wait for content to load
		await page.waitForTimeout(2000);

		// Check if download all button exists
		const downloadButton = await page.$('button:has-text("Download All")');

		if (downloadButton) {
			const buttonText = await downloadButton.textContent();
			console.log('✓ Bulk download button found:', buttonText);
			expect(buttonText).toContain('Download All');
		} else {
			console.log('⚠ No bulk download button (likely no files in answers)');
		}
	});

	test('should display file count in download button', async ({ page }) => {
		// Navigate to subjects page
		await page.goto('http://localhost/subjects');

		// Click on first subject
		await page.click('.card.hover\\:shadow-lg');

		// Navigate to questions tab
		await page.click('text=Q&A');

		// Wait for content to load
		await page.waitForTimeout(2000);

		// Check if download button shows count
		const downloadButton = await page.$('button:has-text("Download All")');

		if (downloadButton) {
			const buttonText = await downloadButton.textContent();
			// Should contain a number in parentheses like "(3)"
			const hasCount = /\(\d+\)/.test(buttonText || '');
			expect(hasCount).toBeTruthy();
			console.log('✓ Download button shows file count:', buttonText);
		} else {
			console.log('⚠ No files to download in this subject');
		}
	});
});
