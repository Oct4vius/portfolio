import { expect, test } from '@playwright/test';

const locales = [
  { path: '/portfolio/', status: 'In progress' },
  { path: '/portfolio/es/', status: 'En desarrollo' },
];

for (const { path, status } of locales) {
  test.describe(path, () => {
    test('Recibo featured with repo link', async ({ page }) => {
      await page.goto(path);
      const link = page.locator('#projects a[href="https://github.com/Oct4vius/Recibo"]');
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    });

    test('Awards in progress, no link', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('#projects')).toContainText(status);
      await expect(page.locator('a[href*="milky" i]')).toHaveCount(0);
      await expect(page.locator('#projects a')).toHaveCount(1);
    });

    test('stack has no percentages', async ({ page }) => {
      await page.goto(path);
      const text = await page.locator('#stack').innerText();
      expect(text.length).toBeGreaterThan(20);
      expect(text).not.toMatch(/\d+\s?%/);
    });

    test('credentials', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('#credentials')).toContainText('Building Data Lakes on AWS');
      await expect(page.locator('#credentials')).toContainText('ITLA');
    });
  });
}
