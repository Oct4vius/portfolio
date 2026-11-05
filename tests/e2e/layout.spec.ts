import { expect, test, type Page } from '@playwright/test';

async function expectAvatarLoaded(page: Page) {
  const avatar = page.locator('.hero img[alt]');
  await expect(avatar).toHaveAttribute('alt', /Octavio Luperón/);
  await expect
    .poll(() => avatar.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
    .toBe(true);
}

test('EN page', async ({ page }) => {
  await page.goto('/portfolio/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByText('Each job handed me a new stack. I shipped in all of them.')).toBeVisible();
  await expectAvatarLoaded(page);
});

test('ES page', async ({ page }) => {
  await page.goto('/portfolio/es/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByText('Cada trabajo me dio un stack nuevo. Entregué en todos.')).toBeVisible();
  await expectAvatarLoaded(page);
});

test('section ids are identical in both locales', async ({ page }) => {
  const ids = ['work', 'projects', 'stack', 'credentials', 'contact'];
  for (const path of ['/portfolio/', '/portfolio/es/']) {
    await page.goto(path);
    const found = await page.locator('main section[id]').evaluateAll((els) => els.map((el) => el.id));
    expect(found).toEqual(ids);
  }
});

test('toggle keeps section', async ({ page }) => {
  await page.goto('/portfolio/#contact');
  await page.getByRole('link', { name: 'ES', exact: true }).click();
  await expect(page).toHaveURL(/\/portfolio\/es\/#contact$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');

  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(/\/portfolio\/#contact$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('toggle without a hash goes to the locale root', async ({ page }) => {
  await page.goto('/portfolio/');
  await page.getByRole('link', { name: 'ES', exact: true }).click();
  await expect(page).toHaveURL(/\/portfolio\/es\/$/);
});

test('changelog content is in the built HTML without JS', async ({ request }) => {
  const html = await (await request.get('/portfolio/')).text();
  expect(html).toContain('Built a queue-driven ingestion and dispatch system');
});

for (const path of ['/portfolio/', '/portfolio/es/']) {
  test(`no horizontal scroll at 360px (${path})`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(path);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(360);
  });
}
