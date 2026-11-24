import { expect, test } from '@playwright/test';
import { customer, item, MockBackend } from './support/mock-backend';

test('home shows counts and links low-stock items to their edit page', async ({ page }) => {
  await new MockBackend({
    items: [item({ id: 'a', name: 'mug' }), item({ id: 'b', name: 'teapot', amountOfStock: 2 })],
    customers: [customer(), customer({ id: 'c2' }), customer({ id: 'c3' })],
  }).install(page);

  await page.goto('/');
  await expect(page.getByTestId('stat-items')).toHaveText('2');
  await expect(page.getByTestId('stat-low-stock')).toHaveText('1');
  await expect(page.getByTestId('stat-customers')).toHaveText('3');

  await page.getByTestId('restock-row').getByRole('link', { name: 'Restock' }).click();
  await expect(page).toHaveURL(/\/items\/b\/update$/);
});

test('home shows a warning when the backend is down', async ({ page }) => {
  const backend = new MockBackend();
  backend.failAll = true;
  await backend.install(page);
  await page.goto('/');
  await expect(page.getByTestId('home-error')).toBeVisible();
  await expect(page.getByTestId('stat-items')).toHaveText('–');
});
