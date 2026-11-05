import { expect, test } from '@playwright/test';

test('reduced motion removes movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/');
  await page.waitForTimeout(1000);

  const reveals = await page.locator('[data-reveal]').count();
  expect(reveals).toBeGreaterThan(0);

  const styles = await page.locator('[data-reveal], .changelog-panel:not([hidden])').evaluateAll((els) =>
    els.map((el) => {
      const s = getComputedStyle(el);
      return {
        transform: s.transform,
        transition: s.transitionProperty,
        animation: s.animationName,
      };
    }),
  );
  expect(styles.length).toBeGreaterThan(reveals);
  for (const s of styles) {
    expect(s.transform).toBe('none');
    expect(s.transition).not.toContain('transform');
    expect(s.animation).not.toContain('transform');
  }
});

test('content visible after load', async ({ page }) => {
  await page.goto('/portfolio/');
  await page.waitForTimeout(1000);
  const opacities = await page
    .locator('[data-reveal]')
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
  expect(opacities.length).toBeGreaterThan(0);
  for (const o of opacities) expect(o).toBe('1');
});

test('reduced motion: pressing does not scale', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  const targets = [
    page.locator('.copy-email-button'),
    page.locator('.changelog-trigger').nth(1),
    page.locator('.cv'),
    page.locator('.handle'),
  ];
  for (const target of targets) {
    await target.scrollIntoViewIfNeeded();
    const box = (await target.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(300);
    expect(await target.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
    await page.mouse.up();
  }
});

test('press still scales without reduced motion', async ({ page }) => {
  await page.goto('/portfolio/');
  const button = page.locator('.copy-email-button');
  await button.scrollIntoViewIfNeeded();
  const box = (await button.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(300);
  expect(await button.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  await page.mouse.up();
});
