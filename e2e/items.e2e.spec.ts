import { expect, test } from '@playwright/test';
import { MockBackend } from './support/mock-backend';

test.describe('Items – create & update (mock backend)', () => {
  let backend: MockBackend;

  test.beforeEach(async ({ page }) => {
    backend = await MockBackend.install(page);
  });

  test('creates an item and shows it in the overview', async ({ page }) => {
    await page.goto('/items/new');
    await expect(page.locator('.navbar-text')).toHaveText(/create item/i);

    await page.locator('#name').fill('  Desk lamp  ');
    await page.locator('#description').fill('LED desk lamp');
    await page.locator('#price').fill('34.99');
    await page.locator('#stock').fill('7');
    await expect(page.getByText('13/255')).toBeVisible();

    await page.getByRole('button', { name: 'create' }).click();

    // lands on the new item's detail page
    await expect(page).toHaveURL(/\/items\/item-\d+$/);
    await expect(page.locator('#name')).toHaveValue('Desk lamp');
    await expect(page.locator('#name')).toBeDisabled();

    const posts = backend.sent('POST', '/items');
    expect(posts).toHaveLength(1);
    expect(posts[0].body).toEqual({ name: 'Desk lamp', description: 'LED desk lamp', price: 34.99, amountOfStock: 7 });

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/items$/);
    const card = page.locator('app-items-card', { hasText: 'Desk lamp' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('€34.99');
    await expect(card).toContainText('medium');
    await expect(page.locator('app-items-card')).toHaveCount(3);
  });

  test('does not send anything while the create form is invalid', async ({ page }) => {
    await page.goto('/items/new');

    await page.locator('#name').fill('Lamp');
    await page.locator('#name').fill('');
    await page.locator('#price').fill('-5');
    await page.locator('#price').blur();
    await page.getByRole('button', { name: 'create' }).click();

    await expect(page.getByText('Please enter a name.')).toBeVisible();
    await expect(page.getByText("Price can't be negative.")).toBeVisible();
    await expect(page).toHaveURL(/\/items\/new$/);
    expect(backend.sent('POST', '/items')).toHaveLength(0);
  });

  test('updates an existing item', async ({ page }) => {
    await page.goto('/items/item-1/update');

    await expect(page.locator('#name')).toHaveValue('Coffee mug');
    await expect(page.locator('#price')).toHaveValue('9.99');

    await page.locator('#name').fill('Coffee mug XL');
    await page.locator('#stock').fill('2');
    await page.getByRole('button', { name: 'update' }).click();

    await expect.poll(() => backend.sent('PUT', '/items/item-1').length).toBe(1);
    expect(backend.sent('PUT', '/items/item-1')[0].body).toEqual({
      name: 'Coffee mug XL',
      description: 'A big mug',
      price: 9.99,
      amountOfStock: 2,
    });

    await expect(page).toHaveURL(/\/items\/item-1$/);
    await expect(page.locator('#name')).toHaveValue('Coffee mug XL');
  });

  test('cancelling an update goes back to the detail page without saving', async ({ page }) => {
    await page.goto('/items/item-1/update');
    await expect(page.locator('#name')).toHaveValue('Coffee mug');

    await page.locator('#name').fill('Something else');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/items\/item-1$/);
    await expect(page.locator('#name')).toHaveValue('Coffee mug');
    expect(backend.sent('PUT', '/items/item-1')).toHaveLength(0);
  });

  test('header "Items" opens the listing and "Add Item" opens the create form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Items', exact: true }).click();
    await expect(page).toHaveURL(/\/items$/);
    await expect(page.locator('app-items-card')).toHaveCount(2);

    await page.getByRole('link', { name: 'Add Item' }).click();
    await expect(page).toHaveURL(/\/items\/new$/);
    await expect(page.locator('.navbar-text')).toHaveText(/create item/i);
  });

  test('reaches the update page from the overview via the detail page', async ({ page }) => {
    await page.goto('/items');
    await page.locator('app-items-card', { hasText: 'Tea pot' }).click();
    await expect(page).toHaveURL(/\/items\/item-2$/);
    await expect(page.locator('#name')).toBeDisabled();

    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page).toHaveURL(/\/items\/item-2\/update$/);
    await expect(page.locator('#name')).toBeEnabled();
    await expect(page.locator('#name')).toHaveValue('Tea pot');
  });
});
