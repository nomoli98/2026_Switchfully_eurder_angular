import { expect, test } from '@playwright/test';
import { item, MockBackend } from './support/mock-backend';

test('add to basket, change amounts, remove, with total and badge', async ({ page }) => {
  await new MockBackend({
    items: [
      item({ id: 'mug', name: 'mug', price: 5 }),
      item({ id: 'plate', name: 'plate', price: 12.5 }),
    ],
  }).install(page);
  const badge = page.getByTestId('basket-badge');

  // add 2 mugs from the detail page
  await page.goto('/items/mug');
  await page.getByLabel('Amount').fill('2');
  await page.getByRole('button', { name: 'Add to basket' }).click();
  await expect(page.getByTestId('basket-confirmation')).toHaveText('Added 2 × mug to your basket.');
  await expect(badge).toContainText('2');

  // add 1 plate (client-side navigation keeps the in-memory basket)
  await page.locator('.navbar-nav').getByRole('link', { name: 'Items' }).click();
  await page.locator('app-items-card', { hasText: 'plate' }).click();
  await page.getByRole('button', { name: 'Add to basket' }).click();
  await expect(badge).toContainText('3');

  await page.getByRole('link', { name: 'View basket' }).click();
  await expect(page).toHaveURL(/\/basket$/);

  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText('mug');
  await expect(rows.nth(0)).toContainText('€10.00');
  await expect(page.getByTestId('basket-total')).toHaveText('€22.50');

  // change the amount of mugs
  await page.getByLabel('Amount of mug').fill('4');
  await page.getByLabel('Amount of mug').press('Enter');
  await page.getByLabel('Amount of mug').blur();
  await expect(rows.nth(0)).toContainText('€20.00');
  await expect(page.getByTestId('basket-total')).toHaveText('€32.50');
  await expect(badge).toContainText('5');

  // an invalid amount is put back
  await page.getByLabel('Amount of mug').fill('0');
  await page.getByLabel('Amount of mug').blur();
  await expect(page.getByLabel('Amount of mug')).toHaveValue('4');

  // remove the plate, then the mug
  await page.getByRole('button', { name: 'Remove plate' }).click();
  await expect(rows).toHaveCount(1);
  await expect(page.getByTestId('basket-total')).toHaveText('€20.00');
  await page.getByRole('button', { name: 'Remove mug' }).click();
  await expect(page.getByText('Your basket is empty')).toBeVisible();
  await expect(badge).toHaveCount(0);
});

test('Place order is a disabled placeholder for now', async ({ page }) => {
  await new MockBackend({ items: [item({ id: 'mug' })] }).install(page);
  await page.goto('/items/mug');
  await page.getByRole('button', { name: 'Add to basket' }).click();
  await page.getByRole('link', { name: 'View basket' }).click();
  await expect(page.getByRole('button', { name: 'Place order' })).toBeDisabled();
});
