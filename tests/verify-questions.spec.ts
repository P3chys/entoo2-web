import { test, expect } from '@playwright/test';

test.describe('Verify Questions Implementation', () => {
	test('verify collapsible questions and bulk download features', async ({ page }) => {
		// Set longer timeout for this test
		test.setTimeout(60000);

		// Login as admin
		await page.goto('http://localhost/login');
		await page.fill('input[type="email"]', 'admin@entoo2.local');
		await page.fill('input[type="password"]', 'AdminPassword123!');
		await page.click('button[type="submit"]');

		// Wait for navigation
		await page.waitForURL('http://localhost/', { timeout: 10000 });
		console.log('✓ Logged in successfully');

		// Navigate directly to a known subject (CS101)
		await page.goto('http://localhost/subjects');
		await page.waitForLoadState('networkidle');

		// Take screenshot of subjects page
		await page.screenshot({ path: 'test-results/1-subjects-page.png', fullPage: true });
		console.log('✓ Screenshot of subjects page saved');

		// Find the CS101 subject by looking for text
		const cs101Link = page.locator('text=CS101').or(page.locator('text=Úvod'));

		if ((await cs101Link.count()) > 0) {
			// Get the parent card/link and click it
			const parentCard = cs101Link
				.first()
				.locator('xpath=ancestor::*[self::a or contains(@class, "cursor-pointer")]')
				.first();
			await parentCard.click();
			await page.waitForLoadState('networkidle');

			console.log('✓ Clicked on CS101 subject');
			await page.screenshot({ path: 'test-results/2-subject-detail.png', fullPage: true });

			// Wait a bit for the page to load
			await page.waitForTimeout(2000);

			// Find and click Questions tab - try multiple possible selectors
			const questionsTabSelectors = [
				'button:has-text("Q&A")',
				'button:has-text("questions")',
				'button:has-text("Otázky")',
				'[data-tab="questions"]'
			];

			let tabClicked = false;
			for (const selector of questionsTabSelectors) {
				try {
					const tab = page.locator(selector);
					if ((await tab.count()) > 0) {
						await tab.first().click();
						tabClicked = true;
						console.log(`✓ Clicked Questions tab using selector: ${selector}`);
						break;
					}
				} catch (e) {
					// Continue to next selector
				}
			}

			await page.waitForTimeout(2000);
			await page.screenshot({ path: 'test-results/3-questions-tab.png', fullPage: true });
			console.log('✓ Screenshot of questions tab saved');

			if (tabClicked) {
				// Verify collapsible questions
				const questionCards = await page
					.locator('.card')
					.filter({ has: page.locator('button') })
					.count();
				console.log(`Found ${questionCards} question cards`);

				if (questionCards > 0) {
					// Check for chevron icons (indicates collapsible)
					const chevronDown = await page.locator('[class*="chevron"]').count();
					console.log(`Found ${chevronDown} chevron icons (collapsible indicators)`);

					// Try to click first question to expand
					const firstQuestion = page
						.locator('.card')
						.filter({ has: page.locator('button') })
						.first();
					await firstQuestion.click();
					await page.waitForTimeout(1000);

					await page.screenshot({ path: 'test-results/4-question-expanded.png', fullPage: true });
					console.log('✓ Clicked first question to expand');
				}

				// Check for bulk download button
				const downloadButton = page.locator('button').filter({ hasText: /Download All/i });
				const downloadCount = await downloadButton.count();

				if (downloadCount > 0) {
					const btnText = await downloadButton.first().textContent();
					console.log(`✓ Found download button: "${btnText}"`);

					// Highlight the button for screenshot
					await downloadButton.first().scrollIntoViewIfNeeded();
					await page.screenshot({ path: 'test-results/5-download-button.png', fullPage: true });
				} else {
					console.log('⚠ No download button found (may indicate no files in answers)');
				}
			} else {
				console.log('⚠ Could not find or click Questions tab');
			}
		} else {
			console.log('⚠ Could not find CS101 subject');
			await page.screenshot({ path: 'test-results/subjects-not-found.png', fullPage: true });
		}

		console.log('\n=== Test Summary ===');
		console.log('Check the screenshots in test-results/ directory for visual verification');
		console.log('1-subjects-page.png - Subjects list');
		console.log('2-subject-detail.png - Subject detail page');
		console.log('3-questions-tab.png - Questions tab content');
		console.log('4-question-expanded.png - Expanded question');
		console.log('5-download-button.png - Download all button (if files exist)');
	});
});
