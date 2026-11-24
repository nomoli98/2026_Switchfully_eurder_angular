import { expect, test } from '@playwright/test';
import { MockBackend } from './support/mock-backend';

test.describe('Home page & theme (mock backend)', () => {
  test.beforeEach(async ({ page }) => {
    await MockBackend.install(page);
  });

  test('shows stock and customer overview', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('item-count')).toHaveText('2');
    await expect(page.getByTestId('low-stock-count')).toHaveText('1');
    await expect(page.getByTestId('customer-count')).toHaveText('1');

    await page.getByTestId('low-stock-list').getByRole('link', { name: 'Restock' }).click();
    await expect(page).toHaveURL(/\/items\/item-2\/update$/);
    await expect(page.locator('#name')).toHaveValue('Tea pot');
  });

  test('the basket button opens the (empty) basket page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Basket' }).click();
    await expect(page).toHaveURL(/\/basket$/);
    await expect(page.getByText('Your basket is empty')).toBeVisible();
  });

  test('add items to the basket, change amounts and remove them', async ({ page }) => {
    const badge = page.getByRole('link', { name: 'Basket' }).locator('.badge');

    await page.goto('/items');
    await page.locator('app-items-card', { hasText: 'Coffee mug' }).click();
    await page.locator('#basketAmount').fill('2');
    await page.getByRole('button', { name: 'Add to basket' }).click();
    await expect(page.getByRole('status')).toContainText('Added 2 × Coffee mug');
    await expect(badge).toContainText('2');

    // navigate inside the app (a full reload would empty the in-memory basket)
    await page.getByRole('navigation').getByRole('link', { name: 'Items', exact: true }).click();
    await page.locator('app-items-card', { hasText: 'Tea pot' }).click();
    await page.getByRole('button', { name: 'Add to basket' }).click();
    await expect(badge).toContainText('3');

    await page.getByRole('link', { name: 'View basket' }).click();
    await expect(page).toHaveURL(/\/basket$/);
    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page.getByTestId('basket-total')).toHaveText('€44.48');

    await page.getByLabel('Amount of Coffee mug').fill('1');
    await page.getByLabel('Amount of Coffee mug').blur();
    await expect(page.getByTestId('basket-total')).toHaveText('€34.49');
    await expect(badge).toContainText('2');

    await page.getByRole('button', { name: 'Remove Tea pot' }).click();
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByTestId('basket-total')).toHaveText('€9.99');

    await page.getByRole('button', { name: 'Remove Coffee mug' }).click();
    await expect(page.getByText('Your basket is empty')).toBeVisible();
    await expect(badge).toHaveCount(0);
  });

  test('the theme toggle switches to dark and remembers it after a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-bs-theme', 'light');

    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(html).toHaveAttribute('data-bs-theme', 'dark');

    await page.reload();
    await expect(html).toHaveAttribute('data-bs-theme', 'dark');
    await page.goto('/customers');
    await expect(html).toHaveAttribute('data-bs-theme', 'dark');

    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(html).toHaveAttribute('data-bs-theme', 'light');
  });

  test('follows the OS dark preference on a first visit', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark');
  });
});
