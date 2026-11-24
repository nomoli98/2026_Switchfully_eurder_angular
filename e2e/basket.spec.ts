import { expect, test } from '@playwright/test';
import { customer, item, MockBackend } from './support/mock-backend';

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

test('place an order: log in from the basket, order, dialog, back to items', async ({ page }) => {
  const backend = new MockBackend({
    items: [item({ id: 'mug', name: 'mug' })],
    customers: [customer({ id: 'ada' }), customer({ id: 'grace', firstname: 'Grace', lastname: 'Hopper' })],
  });
  await backend.install(page);

  await page.goto('/items/mug');
  await page.getByLabel('Amount').fill('3');
  await page.getByRole('button', { name: 'Add to basket' }).click();
  await page.getByRole('link', { name: 'View basket' }).click();

  // logged out: the button sends you to the login page, which brings you back
  await page.getByRole('button', { name: 'Log in to place order' }).click();
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fbasket$/);
  await page.getByLabel('Customer').selectOption({ label: 'Grace Hopper' });
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/basket$/);
  await expect(page.getByTestId('header-user')).toHaveText('Grace Hopper');

  await page.getByRole('button', { name: 'Place order' }).click();
  const dialog = page.getByRole('dialog', { name: 'Order placed' });
  await expect(dialog).toContainText('Your order has been successfully placed.');
  expect(backend.requestsTo('POST', '/orders')[0].body).toEqual({
    customerId: 'grace',
    itemGroups: [{ itemId: 'mug', orderedAmount: 3 }],
  });
  await expect(page.getByTestId('basket-badge')).toHaveCount(0);

  await dialog.getByRole('button', { name: 'Okidoki' }).click();
  await expect(page).toHaveURL(/\/items$/);

  // the login survives a refresh, and logging out works
  await page.reload();
  await expect(page.getByTestId('header-user')).toHaveText('Grace Hopper');
  await page.getByTestId('logout').click();
  await expect(page.getByTestId('login-link')).toBeVisible();
});

test('a failed order keeps the basket and tells the user', async ({ page }) => {
  const backend = new MockBackend({ items: [item({ id: 'mug' })], customers: [customer({ id: 'ada' })] });
  await backend.install(page);
  await page.goto('/login');
  await page.getByLabel('Customer').selectOption({ label: 'Ada Lovelace' });
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.goto('/items/mug');
  await page.getByRole('button', { name: 'Add to basket' }).click();
  await page.getByRole('link', { name: 'View basket' }).click();
  backend.failAll = true;
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByTestId('order-error')).toContainText('could not be placed');
  await expect(page.locator('tbody tr')).toHaveCount(1);
});
