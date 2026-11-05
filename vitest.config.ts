/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig(
  {
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/unit/**/*.test.{ts,tsx}'],
      // getViteConfig leaves BASE_URL at '/', so mirror astro.config.mjs `base` here.
      env: { BASE_URL: '/portfolio/' },
    },
  },
  { base: '/portfolio' },
);
