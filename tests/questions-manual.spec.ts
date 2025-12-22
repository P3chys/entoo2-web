import { test, expect } from '@playwright/test';

test.describe('Questions Feature - Manual Verification', () => {
  test('manually verify collapsible questions and bulk download', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost/login');
    await page.fill('input[type="email"]', 'admin@entoo2.local');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL('http://localhost/', { timeout: 10000 });

    console.log('✓ Logged in successfully');

    // Navigate to subjects
    await page.goto('http://localhost/subjects');
    await page.waitForTimeout(2000);

    console.log('✓ Navigated to subjects page');

    // Click on the first subject link (CS101 - Úvod)
    const subjectLinks = await page.$$('a[href*="/subjects/"]');
    if (subjectLinks.length > 0) {
      await subjectLinks[0].click();
      await page.waitForTimeout(2000);

      console.log('✓ Opened subject detail page');

      // Try to find and click the Questions tab
      const questionsTab = await page.getByText('Q&A').or(page.getByText('Otázky'));
      if (await questionsTab.count() > 0) {
        await questionsTab.first().click();
        await page.waitForTimeout(2000);

        console.log('✓ Clicked on Questions tab');

        // Take a screenshot of the questions page
        await page.screenshot({ path: 'test-results/questions-page.png', fullPage: true });
        console.log('✓ Screenshot saved to test-results/questions-page.png');

        // Check for collapsible questions
        const questionCards = await page.$$('.card.p-5.border-l-4');
        console.log(`Found ${questionCards.length} questions`);

        if (questionCards.length > 0) {
          // Try clicking the first question to expand it
          await questionCards[0].click();
          await page.waitForTimeout(500);

          await page.screenshot({ path: 'test-results/question-expanded.png', fullPage: true });
          console.log('✓ Expanded question - screenshot saved');
        }

        // Check for download button
        const downloadBtn = await page.$('button:has-text("Download All")');
        if (downloadBtn) {
          const btnText = await downloadBtn.textContent();
          console.log(`✓ Found download button: ${btnText}`);

          await page.screenshot({ path: 'test-results/download-button.png', fullPage: true });
        } else {
          console.log('⚠ No download button found (no files in answers)');
        }

      } else {
        console.log('⚠ Could not find Questions/Q&A tab');
        await page.screenshot({ path: 'test-results/subject-page.png', fullPage: true });
      }
    } else {
      console.log('⚠ No subjects found');
    }

    // Keep browser open for manual inspection
    await page.waitForTimeout(5000);
  });
});
