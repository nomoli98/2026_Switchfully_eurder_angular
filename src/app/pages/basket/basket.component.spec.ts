import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BasketComponent } from './basket.component';
import { BasketService } from '../../core/services/basket/basket.service';
import { ItemService } from '../../core/services/item/item.service';
import { makeItem, q, text } from '../../../testing/fixtures';

describe('BasketComponent', () => {
  let fixture: ComponentFixture<BasketComponent>;
  let el: HTMLElement;
  let basket: BasketService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [BasketComponent],
      providers: [
        provideRouter([]),
        {
          provide: ItemService,
          useValue: { getAllItems: () => of([makeItem()]), getOneItem: () => of(makeItem()) },
        },
      ],
    });
    basket = TestBed.inject(BasketService);
    fixture = TestBed.createComponent(BasketComponent);
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  it('shows the empty state with a link to the items', () => {
    expect(text(el)).toContain('Your basket is empty');
    expect(q<HTMLAnchorElement>(el, 'a.btn-success').getAttribute('href')).toBe('/items');
    expect(el.querySelector('app-basket-table')).toBeNull();
  });

  it('shows the table and Place order once something is in the basket', async () => {
    basket.addToBasket('item-1', 2);
    await fixture.whenStable();
    expect(el.querySelector('app-basket-table')).not.toBeNull();
    expect(text(el)).not.toContain('Your basket is empty');
    const place = q<HTMLButtonElement>(el, 'button.btn-lg');
    expect(text(place)).toBe('Place order');
    expect(place.disabled).toBe(true); // placeholder until ORBA3
  });

  it('goes back to the empty state when the last line is removed', async () => {
    basket.addToBasket('item-1');
    await fixture.whenStable();
    basket.removeItem('item-1');
    await fixture.whenStable();
    expect(text(el)).toContain('Your basket is empty');
  });
});
