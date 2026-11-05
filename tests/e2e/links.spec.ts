import { expect, test } from '@playwright/test';

const paths = ['/portfolio/', '/portfolio/es/'];

test('contact links', async ({ page }) => {
  await page.goto('/portfolio/');
  const contact = page.locator('#contact');
  await expect(contact.locator('a[href="mailto:armando2445@outlook.com"]')).toHaveCount(1);
  await expect(contact.locator('a[href="https://linkedin.com/in/octavioluperon/"]')).toHaveCount(1);
  await expect(contact.locator('a[href="https://github.com/Oct4vius"]')).toHaveCount(1);
  await expect(contact.locator('a[download]')).toHaveAttribute('href', '/portfolio/cv/Octavio-Luperon-CV-EN.pdf');

  await page.goto('/portfolio/es/');
  await expect(page.locator('#contact a[download]')).toHaveAttribute('href', /Octavio-Luperon-CV-ES\.pdf$/);
});

for (const path of paths) {
  test(`all same-origin hrefs and srcs return 200 (${path})`, async ({ page, request }) => {
    await page.goto(path);
    const urls = await page.evaluate(() => {
      const out = new Set<string>();
      document.querySelectorAll('a[href], img[src], link[href]').forEach((el) => {
        if (el.getAttribute('rel') === 'alternate' && el.hasAttribute('hreflang')) return;
        const v = el.getAttribute('href') ?? el.getAttribute('src');
        if (v && v.startsWith('/') && !v.startsWith('//')) out.add(v.split('#')[0]);
      });
      return [...out];
    });
    expect(urls.length).toBeGreaterThan(3);
    for (const url of urls) {
      const res = await request.get(url);
      expect(res.status(), url).toBe(200);
    }
  });

  test(`no phone on page (${path})`, async ({ page }) => {
    await page.goto(path);
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/829/);
  });
}

test('404 page links back to both locales', async ({ page }) => {
  await page.goto('/portfolio/404.html');
  await expect(page.locator('a[href="/portfolio/"]').filter({ hasText: /Back/ })).toHaveCount(1);
  await expect(page.locator('a[href="/portfolio/es/"]').filter({ hasText: /Volver/ })).toHaveCount(1);
});
