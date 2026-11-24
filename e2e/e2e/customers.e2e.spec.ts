import { expect, test } from '@playwright/test';
import { MockBackend } from './support/mock-backend';

test.describe('Customers – create & update (mock backend)', () => {
  let backend: MockBackend;

  test.beforeEach(async ({ page }) => {
    backend = await MockBackend.install(page);
  });

  test('creates a customer and lands on their detail page', async ({ page }) => {
    await page.goto('/customers/new');

    await page.locator('#firstname').fill('John');
    await page.locator('#lastname').fill('Smith');
    await page.locator('#email').fill('john.smith@mail.be');
    await page.locator('#callingCode').fill('32');
    await page.locator('#phone').fill('470 11 22 33');
    await page.locator('#street').fill('Kerkstraat');
    await page.locator('#houseNumber').fill('5');
    await page.locator('#postalCode').fill('3000');
    await page.locator('#country').fill('Belgium');

    await page.getByRole('button', { name: 'create' }).click();

    await expect(page).toHaveURL(/\/customers\/cust-\d+$/);
    const posts = backend.sent('POST', '/customers');
    expect(posts).toHaveLength(1);
    expect(posts[0].body).toEqual({
      firstname: 'John',
      lastname: 'Smith',
      email: { complete: 'john.smith@mail.be', localPart: 'john.smith', domain: 'mail.be' },
      phoneNumber: { countryCallingCode: '+32', number: '470 11 22 33' },
      address: { streetName: 'Kerkstraat', houseNumber: '5', postalCode: '3000', country: 'Belgium' },
    });

    await expect(page.locator('#lastname')).toHaveValue('Smith');
    await expect(page.locator('#lastname')).toBeDisabled();

    await page.goto('/customers');
    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page.locator('tbody')).toContainText('Smith');
  });

  test('shows validation errors and does not send an invalid customer', async ({ page }) => {
    await page.goto('/customers/new');

    await page.locator('#email').fill('not-an-email');
    await page.locator('#callingCode').fill('+32');
    await page.locator('#callingCode').blur();
    await page.getByRole('button', { name: 'create' }).click();

    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Invalid code (e.g. 32).')).toBeVisible();
    await expect(page).toHaveURL(/\/customers\/new$/);
    expect(backend.sent('POST', '/customers')).toHaveLength(0);
  });

  test('updates an existing customer', async ({ page }) => {
    await page.goto('/customers');
    await page.locator('tbody tr', { hasText: 'cust-1' }).getByRole('button', { name: 'Edit' }).click();
    await expect(page).toHaveURL(/\/customers\/cust-1\/edit$/);

    await expect(page.locator('#firstname')).toHaveValue('Jane');
    await expect(page.locator('#email')).toHaveValue('jane@doe.com');
    await expect(page.locator('#callingCode')).toHaveValue('32');

    await page.locator('#email').fill('jane.doe@work.org');
    await page.locator('#street').fill('Station road');
    await page.getByRole('button', { name: 'update' }).click();

    await expect(page).toHaveURL(/\/customers\/cust-1$/);
    const puts = backend.sent('PUT', '/customers/cust-1');
    expect(puts).toHaveLength(1);
    expect(puts[0].body).toMatchObject({
      firstname: 'Jane',
      lastname: 'Doe',
      phoneNumber: { countryCallingCode: '+32', number: '470 12 34 56' },
      email: { complete: 'jane.doe@work.org', localPart: 'jane.doe', domain: 'work.org' },
      address: { streetName: 'Station road', houseNumber: '12B', postalCode: '1000', country: 'Belgium' },
    });

    await expect(page.locator('#email')).toHaveValue('jane.doe@work.org');
    await expect(page.locator('#street')).toHaveValue('Station road');
  });

  test('header "Customers" opens the listing and "Add Customer" opens the create form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Customers', exact: true }).click();
    await expect(page).toHaveURL(/\/customers$/);
    await expect(page.locator('tbody tr')).toHaveCount(1);

    await page.getByRole('button', { name: 'Add Customer' }).click();
    await expect(page).toHaveURL(/\/customers\/new$/);
  });

  test('cancelling an update goes back to the detail page without saving', async ({ page }) => {
    await page.goto('/customers/cust-1/edit');
    await expect(page.locator('#firstname')).toHaveValue('Jane');

    await page.locator('#firstname').fill('Changed');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/customers\/cust-1$/);
    expect(backend.sent('PUT', '/customers/cust-1')).toHaveLength(0);
    await expect(page.locator('#firstname')).toHaveValue('Jane');
  });
});
