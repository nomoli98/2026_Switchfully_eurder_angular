import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BasketComponent } from './basket.component';
import { BasketService } from '../../core/services/basket/basket.service';
import { ItemService } from '../../core/services/item/item.service';
import { EurderService } from '../../core/services/eurder/eurder.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { makeItem, makeUser, q, text } from '../../../testing/fixtures';

describe('BasketComponent', () => {
  let fixture: ComponentFixture<BasketComponent>;
  let el: HTMLElement;
  let basket: BasketService;
  const createEurder = vi.fn();

  beforeEach(async () => {
    localStorage.clear();
    createEurder.mockReset().mockReturnValue(of({}));
    TestBed.configureTestingModule({
      imports: [BasketComponent],
      providers: [
        provideRouter([]),
        {
          provide: ItemService,
          useValue: { getAllItems: () => of([makeItem()]), getOneItem: () => of(makeItem()) },
        },
        { provide: EurderService, useValue: { createEurder } },
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
    expect(text(q(el, '[data-testid="place-order"]'))).toBe('Log in to place order');
  });

  it('goes back to the empty state when the last line is removed', async () => {
    basket.addToBasket('item-1');
    await fixture.whenStable();
    basket.removeItem('item-1');
    await fixture.whenStable();
    expect(text(el)).toContain('Your basket is empty');
  });

  describe('placing an order', () => {
    let router: Router;

    beforeEach(async () => {
      router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
      basket.addToBasket('item-1', 2);
      await fixture.whenStable();
    });

    afterEach(() => localStorage.clear());

    it('sends a logged-out user to the login page and comes back to the basket', () => {
      q<HTMLButtonElement>(el, '[data-testid="place-order"]').click();
      expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/basket' } });
      expect(createEurder).not.toHaveBeenCalled();
    });

    it('creates the order for the logged-in customer, clears the basket and shows the dialog', async () => {
      TestBed.inject(AuthService).login(makeUser());
      await fixture.whenStable();
      expect(text(q(el, '[data-testid="place-order"]'))).toBe('Place order');

      q<HTMLButtonElement>(el, '[data-testid="place-order"]').click();
      await fixture.whenStable();

      expect(createEurder).toHaveBeenCalledWith({
        customerId: 'user-1',
        itemGroups: [{ itemId: 'item-1', orderedAmount: 2 }],
      });
      expect(basket.basket()).toEqual([]);
      const dialog = q(el, '[data-testid="order-placed-dialog"]');
      expect(text(dialog)).toContain('Your order has been successfully placed.');

      q<HTMLButtonElement>(dialog, '.modal-footer button').click();
      await fixture.whenStable();
      expect(router.navigate).toHaveBeenCalledWith(['/items']);
      expect(el.querySelector('[data-testid="order-placed-dialog"]')).toBeNull();
    });

    it('keeps the basket and shows an error when the order fails', async () => {
      createEurder.mockReturnValue(throwError(() => new Error('400')));
      TestBed.inject(AuthService).login(makeUser());
      await fixture.whenStable();

      q<HTMLButtonElement>(el, '[data-testid="place-order"]').click();
      await fixture.whenStable();

      expect(basket.basket()).toHaveLength(1);
      expect(text(q(el, '[data-testid="order-error"]'))).toContain('could not be placed');
      expect(el.querySelector('[data-testid="order-placed-dialog"]')).toBeNull();
    });
  });
});
