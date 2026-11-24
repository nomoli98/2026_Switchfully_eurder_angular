import { Page, Route } from '@playwright/test';

export interface ApiItem {
  id: string;
  name: string;
  description: string;
  img: string;
  price: number;
  amountOfStock: number;
  stockUrgency: 'STOCK_LOW' | 'STOCK_MEDIUM' | 'STOCK_HIGH';
}

export interface ApiCustomer {
  id: string;
  firstname: string;
  lastname: string;
  email: { localPart: string; domain: string; complete: string };
  address: { streetName: string; houseNumber: string; postalCode: string; country: string };
  phoneNumber: { number: string; countryCallingCode: string };
}

export interface RecordedRequest {
  method: string;
  path: string;
  body: unknown;
}

const API = 'http://localhost:9001';

function urgency(stock: number): ApiItem['stockUrgency'] {
  return stock < 5 ? 'STOCK_LOW' : stock < 10 ? 'STOCK_MEDIUM' : 'STOCK_HIGH';
}

export function item(overrides: Partial<ApiItem> = {}): ApiItem {
  const amountOfStock = overrides.amountOfStock ?? 20;
  return {
    id: 'item-1',
    name: 'mug',
    description: 'A coffee mug',
    img: '',
    price: 9.5,
    amountOfStock,
    stockUrgency: urgency(amountOfStock),
    ...overrides,
  };
}

export function customer(overrides: Partial<ApiCustomer> = {}): ApiCustomer {
  return {
    id: 'cust-1',
    firstname: 'Ada',
    lastname: 'Lovelace',
    email: { localPart: 'ada', domain: 'example.com', complete: 'ada@example.com' },
    address: {
      streetName: 'Main street',
      houseNumber: '1',
      postalCode: '1000',
      country: 'Belgium',
    },
    phoneNumber: { number: '470123456', countryCallingCode: '+32' },
    ...overrides,
  };
}

/**
 * In-memory stand-in for the Örder backend. It remembers what is created/updated
 * and records every request, so tests can check both the screen and the payload.
 */
export class MockBackend {
  readonly items = new Map<string, ApiItem>();
  readonly customers = new Map<string, ApiCustomer>();
  readonly requests: RecordedRequest[] = [];
  failAll = false;
  private nextId = 1;

  constructor(seed: { items?: ApiItem[]; customers?: ApiCustomer[] } = {}) {
    seed.items?.forEach((i) => this.items.set(i.id, i));
    seed.customers?.forEach((c) => this.customers.set(c.id, c));
  }

  async install(page: Page) {
    await page.route(`${API}/**`, (route) => this.handle(route));
  }

  requestsTo(method: string, pathPrefix: string) {
    return this.requests.filter((r) => r.method === method && r.path.startsWith(pathPrefix));
  }

  private async handle(route: Route) {
    const request = route.request();
    const method = request.method();
    if (method === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: cors() });
    }
    const path = new URL(request.url()).pathname;
    const body = request.postData() ? request.postDataJSON() : undefined;
    this.requests.push({ method, path, body });

    if (this.failAll) {
      return json(route, 500, { message: 'server down' });
    }

    const [, collection, id] = path.split('/');
    if (collection === 'items') {
      return this.crud(route, method, id, this.items, (b, existingId) => {
        const stock = Number(b.amountOfStock);
        return item({
          ...b,
          id: existingId ?? `item-new-${this.nextId++}`,
          amountOfStock: stock,
          stockUrgency: urgency(stock),
        });
      });
    }
    if (collection === 'customers') {
      return this.crud(route, method, id, this.customers, (b, existingId) => ({
        ...b,
        id: existingId ?? `cust-new-${this.nextId++}`,
      }));
    }
    return json(route, 404, { message: 'not found' });
  }

  private crud<T extends { id: string }>(
    route: Route,
    method: string,
    id: string | undefined,
    store: Map<string, T>,
    build: (body: any, existingId?: string) => T,
  ) {
    const body = route.request().postData() ? route.request().postDataJSON() : {};
    if (method === 'GET' && !id) return json(route, 200, [...store.values()]);
    if (method === 'GET' && id)
      return store.has(id) ? json(route, 200, store.get(id)) : json(route, 404, {});
    if (method === 'POST' && !id) {
      const created = build(body);
      store.set(created.id, created);
      return json(route, 201, created);
    }
    if (method === 'PUT' && id) {
      if (!store.has(id)) return json(route, 404, {});
      const updated = build(body, id);
      store.set(id, updated);
      return json(route, 200, updated);
    }
    return json(route, 405, {});
  }
}

function cors() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': '*',
  };
}

function json(route: Route, status: number, body: unknown) {
  return route.fulfill({
    status,
    headers: { ...cors(), 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}
