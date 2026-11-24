import { Page, Request } from '@playwright/test';

export const API = 'http://localhost:9001';

export interface MockItem {
  id: string;
  name: string;
  description: string;
  img: string;
  price: number;
  amountOfStock: number;
  stockUrgency: 'STOCK_LOW' | 'STOCK_MEDIUM' | 'STOCK_HIGH';
}

export interface MockCustomer {
  id: string;
  firstname: string;
  lastname: string;
  email: { complete: string; localPart: string; domain: string };
  address: { streetName: string; houseNumber: string; postalCode: string; country: string };
  phoneNumber: { countryCallingCode: string; number: string };
}

const urgencyFor = (stock: number): MockItem['stockUrgency'] =>
  stock < 5 ? 'STOCK_LOW' : stock < 10 ? 'STOCK_MEDIUM' : 'STOCK_HIGH';

export const seedItems = (): MockItem[] => [
  { id: 'item-1', name: 'Coffee mug', description: 'A big mug', img: '', price: 9.99, amountOfStock: 20, stockUrgency: 'STOCK_HIGH' },
  { id: 'item-2', name: 'Tea pot', description: 'Ceramic pot', img: '', price: 24.5, amountOfStock: 3, stockUrgency: 'STOCK_LOW' },
];

export const seedCustomers = (): MockCustomer[] => [
  {
    id: 'cust-1',
    firstname: 'Jane',
    lastname: 'Doe',
    email: { complete: 'jane@doe.com', localPart: 'jane', domain: 'doe.com' },
    address: { streetName: 'Main street', houseNumber: '12B', postalCode: '1000', country: 'Belgium' },
    phoneNumber: { countryCallingCode: '+32', number: '470 12 34 56' },
  },
];

/**
 * A tiny stateful fake of the Eurder REST API. Creates/updates are kept in memory,
 * so follow-up GETs (e.g. the list after creating) reflect the change.
 * Every request is recorded in `requests` so tests can assert on what the app sent.
 */
export class MockBackend {
  items = seedItems();
  customers = seedCustomers();
  requests: { method: string; path: string; body: any }[] = [];
  private nextId = 100;

  static async install(page: Page): Promise<MockBackend> {
    const backend = new MockBackend();
    await page.route(`${API}/**`, async (route) => {
      const req = route.request();
      const { status, body } = backend.handle(req);
      await route.fulfill({
        status,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(body ?? null),
      });
    });
    return backend;
  }

  /** Requests with the given method and path, in order. */
  sent(method: string, path: string) {
    return this.requests.filter((r) => r.method === method && r.path === path);
  }

  private handle(req: Request): { status: number; body?: unknown } {
    const method = req.method();
    const path = new URL(req.url()).pathname;
    if (method === 'OPTIONS') return { status: 204 };

    const body = req.postDataJSON?.() ?? null;
    this.requests.push({ method, path, body });

    const [, resource, id] = path.split('/');
    const collection = resource === 'items' ? this.items : resource === 'customers' ? this.customers : null;
    if (!collection) return { status: 404 };

    if (method === 'GET' && !id) return { status: 200, body: collection };

    if (method === 'GET' && id) {
      const found = (collection as { id: string }[]).find((x) => x.id === id);
      return found ? { status: 200, body: found } : { status: 404 };
    }

    if (method === 'POST' && !id) {
      const created =
        resource === 'items'
          ? { id: `item-${this.nextId++}`, img: '', ...body, stockUrgency: urgencyFor(body.amountOfStock) }
          : { id: `cust-${this.nextId++}`, ...body };
      (collection as any[]).push(created);
      return { status: 201, body: created };
    }

    if (method === 'PUT' && id) {
      const idx = (collection as { id: string }[]).findIndex((x) => x.id === id);
      if (idx === -1) return { status: 404 };
      const updated =
        resource === 'items'
          ? { ...collection[idx], ...body, id, stockUrgency: urgencyFor(body.amountOfStock) }
          : { ...collection[idx], ...body, id };
      (collection as any[])[idx] = updated;
      return { status: 200, body: updated };
    }

    return { status: 405 };
  }
}
