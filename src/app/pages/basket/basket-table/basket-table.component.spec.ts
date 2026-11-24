import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { BasketTableComponent } from './basket-table.component';
import { BasketService } from '../../../core/services/basket/basket.service';
import { ItemService } from '../../../core/services/item/item.service';
import { makeItem, q, qa, text, typeInto } from '../../../../testing/fixtures';

const items = [
  makeItem({ id: 'a', name: 'mug', price: 5 }),
  makeItem({ id: 'b', name: 'plate', price: 12.5 }),
];

describe('BasketTableComponent', () => {
  let fixture: ComponentFixture<BasketTableComponent>;
  let el: HTMLElement;
  let basket: BasketService;

  async function setup(allItems: any = of(items), stable = true) {
    TestBed.configureTestingModule({
      imports: [BasketTableComponent],
      providers: [
        provideRouter([]),
        {
          provide: ItemService,
          useValue: {
            getAllItems: () => allItems,
            getOneItem: (id: string) => of(items.find((i) => i.id === id)!),
          },
        },
      ],
    });
    basket = TestBed.inject(BasketService);
    basket.addToBasket('a', 2);
    basket.addToBasket('b', 1);
    fixture = TestBed.createComponent(BasketTableComponent);
    fixture.componentRef.setInput('basket', basket.basket());
    // whenStable() would wait forever on a request that never answers
    if (stable) await fixture.whenStable();
    else fixture.detectChanges();
    el = fixture.nativeElement;
  }

  /** In the app the parent passes basket(); mimic that after each change */
  async function sync() {
    fixture.componentRef.setInput('basket', basket.basket());
    await fixture.whenStable();
  }

  const rows = () => qa(el, 'tbody tr');
  const total = () => text(q(el, '[data-testid=basket-total]'));

  it('has the Product, Amount, Price headers', async () => {
    await setup();
    expect(qa(el, 'thead th').slice(0, 3).map(text)).toEqual(['Product', 'Amount', 'Price']);
  });

  it('renders each line as a real <tr> directly in <tbody> (no wrapper element)', async () => {
    await setup();
    expect(rows()).toHaveLength(2);
    for (const row of rows()) {
      expect(row.parentElement!.tagName).toBe('TBODY');
      expect(row.querySelectorAll('td')).toHaveLength(4);
    }
  });

  it('shows the total of amount × unit price', async () => {
    await setup();
    expect(total()).toBe('€22.50');
  });

  it('shows a placeholder total while prices load', async () => {
    await setup(NEVER, false);
    expect(q(el, '[data-testid=basket-total] .placeholder')).toBeTruthy();
  });

  it('changing an amount updates the basket service and the total', async () => {
    await setup();
    typeInto(q<HTMLInputElement>(rows()[0] as HTMLElement, 'input'), '4');
    await sync();
    expect(basket.basket()[0]).toEqual({ itemId: 'a', orderedAmount: 4 });
    expect(total()).toBe('€32.50');
  });

  it('Remove takes the line out of the basket', async () => {
    await setup();
    q<HTMLButtonElement>(rows()[0] as HTMLElement, 'button').click();
    await sync();
    expect(basket.basket()).toEqual([{ itemId: 'b', orderedAmount: 1 }]);
    expect(rows()).toHaveLength(1);
    expect(total()).toBe('€12.50');
  });
});
