import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ItemService } from './item.service';
import { StockUrgencyEnum } from '../enums/stock-urgency.enum';
import { API_URL, makeItem, makeItemRes } from '../../../testing/fixtures';

describe('ItemService', () => {
  let service: ItemService;
  let http: HttpTestingController;
  const url = `${API_URL}/items`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ItemService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('getAllItems', () => {
    it('GETs /items and maps every item', () => {
      let result: unknown;
      service.getAllItems().subscribe((r) => (result = r));

      const req = http.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush([
        makeItemRes({ id: '1', stockUrgency: 'STOCK_LOW' }),
        makeItemRes({ id: '2', stockUrgency: 'STOCK_MEDIUM' }),
      ]);

      expect(result).toEqual([
        makeItem({ id: '1', stockUrgency: StockUrgencyEnum.LOW }),
        makeItem({ id: '2', stockUrgency: StockUrgencyEnum.MEDIUM }),
      ]);
    });

    it('returns an empty list when the API has no items', () => {
      let result: unknown;
      service.getAllItems().subscribe((r) => (result = r));
      http.expectOne(url).flush([]);
      expect(result).toEqual([]);
    });
  });

  describe('getOneItem', () => {
    it('GETs /items/:id and maps the item', () => {
      let result: unknown;
      service.getOneItem('42').subscribe((r) => (result = r));

      const req = http.expectOne(`${url}/42`);
      expect(req.request.method).toBe('GET');
      req.flush(makeItemRes({ id: '42', stockUrgency: 'STOCK_LOW' }));

      expect(result).toEqual(makeItem({ id: '42', stockUrgency: StockUrgencyEnum.LOW }));
    });

    it('propagates HTTP errors', () => {
      let status = 0;
      service.getOneItem('nope').subscribe({ error: (e) => (status = e.status) });
      http.expectOne(`${url}/nope`).flush('Not found', { status: 404, statusText: 'Not Found' });
      expect(status).toBe(404);
    });
  });

  describe('createItem', () => {
    it('POSTs a trimmed request body without id/img/urgency', () => {
      service.createItem(makeItem({ id: '', name: '  Mug ', description: ' Big ' })).subscribe();

      const req = http.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Mug', description: 'Big', price: 9.99, amountOfStock: 20 });
      req.flush(makeItemRes());
    });

    it('maps the created item from the response', () => {
      let result: unknown;
      service.createItem(makeItem()).subscribe((r) => (result = r));
      http.expectOne(url).flush(makeItemRes({ id: 'new-id', stockUrgency: 'STOCK_MEDIUM' }));
      expect(result).toEqual(makeItem({ id: 'new-id', stockUrgency: StockUrgencyEnum.MEDIUM }));
    });
  });

  describe('updateItem', () => {
    it('PUTs to /items/:id with the request body', () => {
      let result: unknown;
      service.updateItem('7', makeItem({ name: 'Renamed', price: 3 })).subscribe((r) => (result = r));

      const req = http.expectOne(`${url}/7`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: 'Renamed', description: 'A big mug', price: 3, amountOfStock: 20 });
      req.flush(makeItemRes({ id: '7', name: 'Renamed', price: 3 }));

      expect(result).toEqual(makeItem({ id: '7', name: 'Renamed', price: 3 }));
    });

    it('propagates validation errors from the backend', () => {
      let status = 0;
      service.updateItem('7', makeItem()).subscribe({ error: (e) => (status = e.status) });
      http.expectOne(`${url}/7`).flush({}, { status: 400, statusText: 'Bad Request' });
      expect(status).toBe(400);
    });
  });
});
