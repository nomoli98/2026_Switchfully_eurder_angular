import { expect, test } from '@playwright/test';
import { item, MockBackend } from './support/mock-backend';

test.describe('items', () => {
  let backend: MockBackend;

  test.beforeEach(async ({ page }) => {
    backend = new MockBackend({
      items: [item({ id: 'mug-1', name: 'mug', price: 9.5, amountOfStock: 20 })],
    });
    await backend.install(page);
  });

  test('create an item', async ({ page }) => {
    await page.goto('/items/new');
    await page.getByLabel('Name').fill('Teapot');
    await page.getByLabel('Description').fill('Holds tea');
    await page.getByLabel('Price').fill('24.99');
    await page.getByLabel('Stock').fill('3');
    await page.getByRole('button', { name: 'create' }).click();

    // lands on the new item's detail page
    await expect(page).toHaveURL(/\/items\/item-new-\d+$/);
    await expect(page.getByLabel('Name')).toHaveValue('Teapot');

    expect(backend.requestsTo('POST', '/items')[0].body).toEqual({
      name: 'Teapot',
      description: 'Holds tea',
      price: 24.99,
      amountOfStock: 3,
    });

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.locator('app-items-card', { hasText: 'Teapot' })).toBeVisible();
  });

  test('an invalid item is not saved', async ({ page }) => {
    await page.goto('/items/new');
    await page.getByLabel('Price').fill('-1');
    await page.getByLabel('Name').click();
    await page.getByLabel('Description').fill('x'.repeat(256));
    await page.getByRole('button', { name: 'create' }).click();

    await expect(page.getByText("Price can't be negative.")).toBeVisible();
    await expect(
      page.getByText('Description cannot be longer than 255 characters').first(),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/items\/new$/);
    expect(backend.requestsTo('POST', '/items')).toHaveLength(0);
  });

  test('update an item', async ({ page }) => {
    await page.goto('/items/mug-1/update');
    await expect(page.getByLabel('Name')).toHaveValue('mug');
    await page.getByLabel('Name').fill('Big mug');
    await page.getByLabel('Price').fill('11');
    await page.getByRole('button', { name: 'update' }).click();

    await expect(page).toHaveURL(/\/items\/mug-1$/);
    await expect(page.getByLabel('Name')).toHaveValue('Big mug');
    expect(backend.requestsTo('PUT', '/items/mug-1')[0].body).toMatchObject({
      name: 'Big mug',
      price: 11,
    });
  });

  test('cancel an update goes back to the detail page without saving', async ({ page }) => {
    await page.goto('/items/mug-1/update');
    await page.getByLabel('Name').fill('Changed');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/\/items\/mug-1$/);
    await expect(page.getByLabel('Name')).toHaveValue('mug');
    expect(backend.requestsTo('PUT', '/items')).toHaveLength(0);
  });

  test('overview → detail → edit', async ({ page }) => {
    await page.goto('/items');
    await page.locator('app-items-card', { hasText: 'mug' }).click();
    await expect(page).toHaveURL(/\/items\/mug-1$/);
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page).toHaveURL(/\/items\/mug-1\/update$/);
  });
});
