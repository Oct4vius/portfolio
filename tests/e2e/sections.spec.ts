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

test('find-in-page reaches bullets of closed changelog entries', async ({ page }) => {
  const panel = page.locator('#changelog-panel-newfold');
  await page.goto('/portfolio/');
  await expect(panel).toHaveAttribute('hidden', 'until-found');
  const closed = await panel.boundingBox();
  expect(closed?.height ?? 0).toBe(0);

  // A text fragment runs the same reveal as Ctrl+F does on a match (fresh load, not a hash change).
  await page.goto('about:blank');
  await page.goto('/portfolio/#:~:text=Measured%20page%20load%20speed');
  await expect(panel).not.toHaveAttribute('hidden');
  await expect(panel).toBeVisible();
  await expect(page.getByRole('button', { name: /Newtech/ })).toHaveAttribute('aria-expanded', 'true');
});
