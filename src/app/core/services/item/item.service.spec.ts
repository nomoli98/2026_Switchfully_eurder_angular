import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ItemService } from './item.service';
import { makeItem, makeItemRes } from '../../../../testing/fixtures';
import { StockUrgencyEnum } from '../../enums/stock-urgency.enum';

const URL = 'http://localhost:9001/items';

describe('ItemService', () => {
  let service: ItemService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ItemService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAllItems GETs /items and maps every item', () => {
    let result: unknown;
    service.getAllItems().subscribe((r) => (result = r));
    const req = http.expectOne(URL);
    expect(req.request.method).toBe('GET');
    req.flush([makeItemRes({ id: 'a', stockUrgency: 'STOCK_LOW' }), makeItemRes({ id: 'b' })]);
    expect(result).toEqual([
      makeItem({ id: 'a', stockUrgency: StockUrgencyEnum.LOW }),
      makeItem({ id: 'b', stockUrgency: StockUrgencyEnum.HIGH }),
    ]);
  });

  it('getOneItem GETs /items/:id', () => {
    let result: unknown;
    service.getOneItem('abc').subscribe((r) => (result = r));
    const req = http.expectOne(`${URL}/abc`);
    expect(req.request.method).toBe('GET');
    req.flush(makeItemRes({ id: 'abc', stockUrgency: 'STOCK_MEDIUM' }));
    expect(result).toEqual(makeItem({ id: 'abc', stockUrgency: StockUrgencyEnum.MEDIUM }));
  });

  it('createItem POSTs only the editable fields, trimmed', () => {
    service
      .createItem(makeItem({ name: '  mug ', description: ' nice  ', id: 'ignored' }))
      .subscribe();
    const req = http.expectOne(URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'mug',
      description: 'nice',
      price: 9.5,
      amountOfStock: 20,
    });
    req.flush(makeItemRes());
  });

  it('createItem returns the mapped saved item', () => {
    let result: unknown;
    service.createItem(makeItem()).subscribe((r) => (result = r));
    http.expectOne(URL).flush(makeItemRes({ id: 'new-id' }));
    expect(result).toEqual(makeItem({ id: 'new-id' }));
  });

  it('updateItem PUTs to /items/:id', () => {
    let result: unknown;
    service.updateItem('xyz', makeItem({ price: 12 })).subscribe((r) => (result = r));
    const req = http.expectOne(`${URL}/xyz`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      name: 'mug',
      description: 'A coffee mug',
      price: 12,
      amountOfStock: 20,
    });
    req.flush(makeItemRes({ id: 'xyz', price: 12 }));
    expect(result).toEqual(makeItem({ id: 'xyz', price: 12 }));
  });

  it('passes HTTP errors through', () => {
    let error: unknown;
    service.getOneItem('nope').subscribe({ error: (e) => (error = e) });
    http.expectOne(`${URL}/nope`).flush('not found', { status: 404, statusText: 'Not Found' });
    expect((error as { status: number }).status).toBe(404);
  });
});
