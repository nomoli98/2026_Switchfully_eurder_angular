import { expect, test } from '@playwright/test';
import { customer, item, MockBackend } from './support/mock-backend';

test.beforeEach(async ({ page }) => {
  await new MockBackend({ items: [item()], customers: [customer()] }).install(page);
});

test('header Items → listing → Add Item', async ({ page }) => {
  await page.goto('/');
  await page.locator('.navbar-nav').getByRole('link', { name: 'Items' }).click();
  await expect(page).toHaveURL(/\/items$/);
  await page.getByRole('link', { name: 'Add Item' }).click();
  await expect(page).toHaveURL(/\/items\/new$/);
  await expect(page.locator('.navbar-nav .nav-link.active')).toHaveText('Items');
});

test('header Customers → listing → Add Customer', async ({ page }) => {
  await page.goto('/');
  await page.locator('.navbar-nav').getByRole('link', { name: 'Customers' }).click();
  await expect(page).toHaveURL(/\/customers$/);
  await page.getByRole('button', { name: 'Add Customer' }).click();
  await expect(page).toHaveURL(/\/customers\/new$/);
});

test('basket button opens the basket', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Basket' }).click();
  await expect(page).toHaveURL(/\/basket$/);
  await expect(page.getByText('Your basket is empty')).toBeVisible();
});
