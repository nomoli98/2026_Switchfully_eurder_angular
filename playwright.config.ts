import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against `ng serve` with a fake backend (e2e/support/mock-backend.ts)
 * that intercepts every call to http://localhost:9001, so the real backend is not needed.
 *
 * First run: npx playwright install chromium
 * Optional: PW_CHROME_PATH=/path/to/chrome to use an installed Chrome instead.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: process.env['PW_CHROME_PATH']
          ? { executablePath: process.env['PW_CHROME_PATH'] }
          : {},
      },
    },
  ],
  webServer: {
    command: 'npx ng serve --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
