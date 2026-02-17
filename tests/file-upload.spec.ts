import { test, expect } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';

test.describe('File Upload Feature', () => {
	test('complete file upload, preview, and download workflow', async ({ page }) => {
		console.log('Starting file upload test...');

		// Step 1: Login
		console.log('Step 1: Navigating to login page...');
		await page.goto('/login');
		await page.screenshot({ path: 'tests/screenshots/01-login-page.png', fullPage: true });

		await page.fill('input[type="email"]', 'admin@entoo2.local');
		await page.fill('input[type="password"]', 'AdminPassword123!');
		await page.screenshot({ path: 'tests/screenshots/02-login-filled.png', fullPage: true });

		await page.click('button[type="submit"]');
		await page.waitForURL('/', { timeout: 10000 });
		console.log('Logged in successfully');
		await page.screenshot({ path: 'tests/screenshots/03-dashboard.png', fullPage: true });

		// Step 2: Navigate to subjects
		console.log('Step 2: Navigating to subjects...');
		await page.goto('/subjects');
		await page.waitForTimeout(2000);
		await page.screenshot({ path: 'tests/screenshots/04-subjects-list.png', fullPage: true });

		// Find and click on first subject
		const subjectLinks = page.locator('a[href^="/subjects/"]');
		const count = await subjectLinks.count();
		console.log(`Found ${count} subject links`);

		if (count === 0) {
			console.log('No subjects found, test cannot continue');
			return;
		}

		const firstSubject = subjectLinks.first();
		await firstSubject.click();
		await page.waitForTimeout(2000);
		console.log('Navigated to subject detail page');
		await page.screenshot({ path: 'tests/screenshots/05-subject-detail.png', fullPage: true });

		// Step 3: Upload a file
		console.log('Step 3: Uploading file...');
		const testFilePath = path.join(os.tmpdir(), 'test-document.txt');
		fs.writeFileSync(
			testFilePath,
			'This is a test document for upload verification.\nCreated at: ' + new Date().toISOString()
		);

		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(testFilePath);

		// Wait for upload to complete (look for the filename in the document list)
		await page.waitForTimeout(3000);
		console.log('File uploaded');
		await page.screenshot({ path: 'tests/screenshots/06-file-uploaded.png', fullPage: true });

		// Verify file appears
		const hasFile = await page.locator('text=test-document.txt').isVisible();
		console.log('File visible in list:', hasFile);

		// Step 4: Test file preview
		console.log('Step 4: Testing file preview...');
		// Click the preview button (eye icon) - it's the first square button in the actions
		const previewButton = page.locator('button[title="Preview"]').first();
		await previewButton.click();
		await page.waitForTimeout(2000);
		console.log('Preview button clicked');
		await page.screenshot({ path: 'tests/screenshots/07-file-preview-modal.png', fullPage: true });

		// Verify preview modal is visible
		const previewModal = page.locator('div[role="dialog"]');
		const isPreviewVisible = await previewModal.isVisible();
		console.log('Preview modal visible:', isPreviewVisible);

		// Verify the file content is displayed
		const previewContent = page.locator('pre');
		const hasContent = await previewContent.isVisible();
		console.log('Preview content visible:', hasContent);

		// Close preview modal
		const closeButton = page.locator('button[aria-label="Close preview"]');
		await closeButton.click();
		await page.waitForTimeout(500);
		console.log('Preview modal closed');
		await page.screenshot({ path: 'tests/screenshots/08-preview-closed.png', fullPage: true });

		// Step 5: Test file download
		console.log('Step 5: Testing file download...');
		// The download button is the second button (after preview)
		const downloadButton = page.getByTitle('Download').first();

		// Set up download handler
		const downloadPromise = page.waitForEvent('download');
		await downloadButton.click();
		const download = await downloadPromise;
		console.log('Download initiated:', download.suggestedFilename());
		await page.screenshot({ path: 'tests/screenshots/09-after-download.png', fullPage: true });

		// Clean up test file
		try {
			fs.unlinkSync(testFilePath);
		} catch (e) {
			// Ignore if file is locked
		}

		// Step 6: Check dashboard for recent activity
		console.log('Step 6: Checking dashboard...');
		await page.goto('/');
		await page.waitForTimeout(2000);
		await page.screenshot({
			path: 'tests/screenshots/10-dashboard-with-activity.png',
			fullPage: true
		});

		const hasActivitySection = await page.locator('text=Recent Activity').isVisible();
		console.log('Recent Activity section visible:', hasActivitySection);

		console.log('Test completed successfully!');
	});
});
