import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: process.env.CI
    ? {
        command: 'npm run start',
        url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
