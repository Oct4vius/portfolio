// Renders the link-preview cards (public/og/og-{en,es}.png) from the site copy.
// Run with `npm run og` after changing the hero copy or the avatar; the PNGs are committed.
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { en } from '../src/content/en.ts';
import { es } from '../src/content/es.ts';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root));
const dataUri = async (path, type) => `data:${type};base64,${(await read(path)).toString('base64')}`;

const [sans, mono, avatar] = await Promise.all([
  dataUri('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2', 'font/woff2'),
  dataUri('node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2', 'font/woff2'),
  dataUri('src/assets/octavio.jpg', 'image/jpeg'),
]);

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Same tokens as src/styles/global.css.
const card = ({ hero }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: Geist; src: url(${sans}) format('woff2'); font-weight: 100 900; }
  @font-face { font-family: 'Geist Mono'; src: url(${mono}) format('woff2'); font-weight: 100 900; }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; padding: 88px 96px 72px;
    background: #0c0c0d; color: #ededed; font-family: Geist, sans-serif;
    display: flex; flex-direction: column; -webkit-font-smoothing: antialiased;
  }
  .identity { display: flex; align-items: center; gap: 32px; }
  .avatar {
    width: 132px; height: 132px; border-radius: 50%;
    object-fit: cover; object-position: 50% 30%; box-shadow: 0 0 0 2px #262628;
  }
  .name { font-size: 60px; font-weight: 600; letter-spacing: -0.03em; line-height: 1.1; }
  .tagline { margin-top: 10px; font-size: 30px; color: #a1a1a1; letter-spacing: -0.01em; }
  .slogan {
    margin-top: 64px; max-width: 960px;
    font-size: 48px; font-weight: 500; line-height: 1.2; letter-spacing: -0.025em; text-wrap: balance;
  }
  .footer {
    margin-top: auto; display: flex; align-items: center; gap: 14px;
    font-family: 'Geist Mono', monospace; font-size: 24px; color: #8a8a8a;
  }
  .dot { width: 12px; height: 12px; border-radius: 50%; background: #5eead4; }
</style></head><body>
  <div class="identity">
    <img class="avatar" src="${avatar}" alt="">
    <div>
      <div class="name">${escape(hero.name)}</div>
      <div class="tagline">${escape(hero.tagline)}</div>
    </div>
  </div>
  <p class="slogan">${escape(hero.slogan)}</p>
  <div class="footer"><span class="dot"></span>oct4vius.github.io/portfolio</div>
</body></html>`;

await mkdir(new URL('public/og/', root), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const content of [en, es]) {
    await page.setContent(card(content));
    await page.evaluate(() => document.fonts.ready);
    const out = new URL(`public/og/og-${content.locale}.png`, root);
    await page.screenshot({ path: fileURLToPath(out) });
    console.log(`wrote public/og/og-${content.locale}.png`);
  }
} finally {
  await browser.close();
}
