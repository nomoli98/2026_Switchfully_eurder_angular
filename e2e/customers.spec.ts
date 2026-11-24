import { expect, Page, test } from '@playwright/test';
import { customer, MockBackend } from './support/mock-backend';

async function fillCustomer(page: Page) {
  await page.getByLabel('First name').fill('Grace');
  await page.getByLabel('Last name').fill('Hopper');
  await page.getByLabel('Email').fill('grace@navy.mil');
  await page.getByLabel('Code', { exact: true }).fill('32');
  await page.getByLabel('Phone number').fill('470 12 34 56');
  await page.getByLabel('Street').fill('Dock street');
  await page.getByLabel('Number', { exact: true }).fill('12B');
  await page.getByLabel('Postal code').fill('2000');
  await page.getByLabel('Country').fill('Belgium');
}

test.describe('customers', () => {
  let backend: MockBackend;

  test.beforeEach(async ({ page }) => {
    backend = new MockBackend({ customers: [customer({ id: 'c1' })] });
    await backend.install(page);
  });

  test('create a customer', async ({ page }) => {
    await page.goto('/customers/new');
    await fillCustomer(page);
    await page.getByRole('button', { name: 'create' }).click();

    await expect(page).toHaveURL(/\/customers\/cust-new-\d+$/);
    expect(backend.requestsTo('POST', '/customers')[0].body).toEqual({
      firstname: 'Grace',
      lastname: 'Hopper',
      email: { complete: 'grace@navy.mil', localPart: 'grace', domain: 'navy.mil' },
      address: {
        streetName: 'Dock street',
        houseNumber: '12B',
        postalCode: '2000',
        country: 'Belgium',
      },
      phoneNumber: { number: '470 12 34 56', countryCallingCode: '+32' },
    });

    await page.getByRole('button', { name: 'Back' }).click();
    const row = page.locator('tbody tr', { hasText: 'Hopper' });
    await expect(row.locator('td').nth(0)).toHaveText('Grace');
    await expect(row.locator('td').nth(1)).toHaveText('Hopper');
  });

  test('an invalid customer is not saved', async ({ page }) => {
    await page.goto('/customers/new');
    await fillCustomer(page);
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Code', { exact: true }).fill('+32');
    await page.getByRole('button', { name: 'create' }).click();

    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Invalid code (e.g. 32).')).toBeVisible();
    expect(backend.requestsTo('POST', '/customers')).toHaveLength(0);
  });

  test('update a customer', async ({ page }) => {
    await page.goto('/customers/c1/edit');
    await expect(page.getByLabel('Code', { exact: true })).toHaveValue('32');
    await page.getByLabel('Last name').fill('King');
    await page.getByRole('button', { name: 'update' }).click();

    await expect(page).toHaveURL(/\/customers\/c1$/);
    await expect(page.getByLabel('Last name')).toHaveValue('King');
    const body = backend.requestsTo('PUT', '/customers/c1')[0].body as any;
    expect(body.lastname).toBe('King');
    expect(body.phoneNumber.countryCallingCode).toBe('+32');
  });

  test('cancel an update goes back without saving', async ({ page }) => {
    await page.goto('/customers/c1/edit');
    await page.getByLabel('First name').fill('Changed');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/\/customers\/c1$/);
    await expect(page.getByLabel('First name')).toHaveValue('Ada');
    expect(backend.requestsTo('PUT', '/customers')).toHaveLength(0);
  });
});
