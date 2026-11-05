import { defineConfig, devices } from '@playwright/test';

// Parallel worktrees each pick their own port so their preview servers don't collide.
const port = Number(process.env.E2E_PORT ?? 4321);
const origin = `http://localhost:${port}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: origin,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${port}`,
    url: `${origin}/portfolio/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
