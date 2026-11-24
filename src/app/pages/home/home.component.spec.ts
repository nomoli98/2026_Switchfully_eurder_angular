import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { HomeComponent } from './home.component';
import { ItemService } from '../../core/services/item/item.service';
import { UserService } from '../../core/services/user/user.service';
import { StockUrgencyEnum } from '../../core/enums/stock-urgency.enum';
import { makeItem, makeUser, q, qa, text } from '../../../testing/fixtures';

const LOW = StockUrgencyEnum.LOW;

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let el: HTMLElement;

  async function setup(items: any, users: any, stable = true) {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: ItemService, useValue: { getAllItems: () => items } },
        { provide: UserService, useValue: { getAllUsers: () => users } },
      ],
    });
    fixture = TestBed.createComponent(HomeComponent);
    // whenStable() would wait forever on a request that never answers
    if (stable) await fixture.whenStable();
    else fixture.detectChanges();
    el = fixture.nativeElement;
  }

  const stat = (id: string) => text(q(el, `[data-testid=stat-${id}]`));

  it('shows item, low-stock and customer counts', async () => {
    await setup(
      of([makeItem({ id: 'a' }), makeItem({ id: 'b', stockUrgency: LOW }), makeItem({ id: 'c' })]),
      of([makeUser(), makeUser({ id: 'u2' })]),
    );
    expect(stat('items')).toBe('3');
    expect(stat('low-stock')).toBe('1');
    expect(stat('customers')).toBe('2');
  });

  it('colours the low-stock count red only when there is low stock', async () => {
    await setup(of([makeItem({ stockUrgency: LOW })]), of([]));
    expect(q(el, '[data-testid=stat-low-stock]').classList).toContain('text-danger');
  });

  it('keeps the low-stock count neutral at 0', async () => {
    await setup(of([makeItem()]), of([]));
    expect(stat('low-stock')).toBe('0');
    expect(q(el, '[data-testid=stat-low-stock]').classList).not.toContain('text-danger');
  });

  it('lists low-stock items, lowest first, max 5', async () => {
    const items = [7, 2, 9, 1, 5, 3].map((stock, i) =>
      makeItem({ id: `i${i}`, name: `item ${stock}`, amountOfStock: stock, stockUrgency: LOW }),
    );
    await setup(of([...items, makeItem({ id: 'ok', name: 'fine' })]), of([]));
    const rows = qa(el, '[data-testid=restock-row]');
    expect(rows.map((r) => text(r.querySelector('a')))).toEqual([
      'item 1',
      'item 2',
      'item 3',
      'item 5',
      'item 7',
    ]);
    expect(text(rows[0].querySelector('.badge'))).toBe('1 left');
  });

  it('Restock links to the item edit page and the name to the detail page', async () => {
    await setup(of([makeItem({ id: 'low1', stockUrgency: LOW })]), of([]));
    const [name, restock] = qa<HTMLAnchorElement>(q(el, '[data-testid=restock-row]'), 'a');
    expect(name.getAttribute('href')).toBe('/items/low1');
    expect(text(restock)).toBe('Restock');
    expect(restock.getAttribute('href')).toBe('/items/low1/update');
  });

  it('says so when nothing is low on stock', async () => {
    await setup(of([makeItem()]), of([]));
    expect(text(el)).toContain('Nothing is low on stock.');
  });

  it('shows placeholders while loading', async () => {
    await setup(NEVER, NEVER, false);
    expect(qa(el, '.placeholder')).toHaveLength(3);
    expect(text(el)).toContain('Loading…');
  });

  it('shows a warning and dashes when the backend is down', async () => {
    await setup(
      throwError(() => new Error('down')),
      throwError(() => new Error('down')),
    );
    expect(el.querySelector('[data-testid=home-error]')).not.toBeNull();
    expect(stat('items')).toBe('–');
    expect(stat('customers')).toBe('–');
  });

  it('still shows customers when only items fail', async () => {
    await setup(
      throwError(() => new Error('down')),
      of([makeUser()]),
    );
    expect(stat('customers')).toBe('1');
    expect(stat('items')).toBe('–');
  });

  it('has the main links and quick actions', async () => {
    await setup(of([]), of([]));
    const hrefs = qa<HTMLAnchorElement>(el, 'a').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining(['/items', '/customers', '/items/new', '/customers/new']),
    );
  });
});
