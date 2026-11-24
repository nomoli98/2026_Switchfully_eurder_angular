import { expect, test } from '@playwright/test';
import { MockBackend } from './support/mock-backend';

test.beforeEach(async ({ page }) => {
  await new MockBackend().install(page);
});

test('dark theme sticks across reloads and pages', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-bs-theme', 'light');

  await page.getByTestId('theme-toggle').click();
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');

  await page.reload();
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');
  await page.locator('.navbar-nav').getByRole('link', { name: 'Items' }).click();
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');
});

test('a first visit follows the OS dark setting', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark');
});
