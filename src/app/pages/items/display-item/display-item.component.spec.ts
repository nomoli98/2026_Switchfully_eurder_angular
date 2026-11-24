import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DisplayItemComponent } from './display-item.component';
import { ItemService } from '../../../core/services/item/item.service';
import { BasketService } from '../../../core/services/basket/basket.service';
import { FormItemComponent } from '../../forms/form-item/form-item.component';
import { makeItem, q, text, typeInto } from '../../../../testing/fixtures';

describe('DisplayItemComponent', () => {
  let fixture: ComponentFixture<DisplayItemComponent>;
  let el: HTMLElement;
  let basket: BasketService;
  const getOneItem = vi.fn(() => of(makeItem({ id: 'abc', name: 'mug' })));

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [DisplayItemComponent],
      providers: [provideRouter([]), { provide: ItemService, useValue: { getOneItem } }],
    });
    basket = TestBed.inject(BasketService);
    fixture = TestBed.createComponent(DisplayItemComponent);
    fixture.componentRef.setInput('id', 'abc');
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  const amount = () => q<HTMLInputElement>(el, '#basketAmount');
  const addButton = () => q<HTMLButtonElement>(el, 'section button');

  it('loads the item and shows it in a read-only form', () => {
    expect(getOneItem).toHaveBeenCalledWith('abc');
    const form = fixture.debugElement.query((d) => d.componentInstance instanceof FormItemComponent)
      .componentInstance as FormItemComponent;
    expect(form.editable()).toBe(false);
    expect(form.item()!.id).toBe('abc');
  });

  it('starts with an amount of 1', () => {
    expect(amount().value).toBe('1');
  });

  it('adds 1 to the basket by default', async () => {
    addButton().click();
    await fixture.whenStable();
    expect(basket.basket()).toEqual([{ itemId: 'abc', orderedAmount: 1 }]);
  });

  it('adds the chosen amount and confirms it', async () => {
    typeInto(amount(), '3');
    await fixture.whenStable();
    addButton().click();
    await fixture.whenStable();
    expect(basket.basket()).toEqual([{ itemId: 'abc', orderedAmount: 3 }]);
    expect(text(q(el, '[data-testid=basket-confirmation]'))).toBe('Added 3 × mug to your basket.');
  });

  it('resets the amount to 1 after adding', async () => {
    typeInto(amount(), '4');
    await fixture.whenStable();
    addButton().click();
    await fixture.whenStable();
    expect(amount().value).toBe('1');
  });

  it('adding twice adds up on the same line', async () => {
    addButton().click();
    addButton().click();
    await fixture.whenStable();
    expect(basket.basket()).toEqual([{ itemId: 'abc', orderedAmount: 2 }]);
  });

  it.each(['0', '-2', '1.5', ''])('disables Add to basket for amount "%s"', async (value) => {
    typeInto(amount(), value);
    await fixture.whenStable();
    expect(addButton().disabled).toBe(true);
    expect(amount().classList).toContain('is-invalid');
  });

  it('has a View basket link', () => {
    const link = q<HTMLAnchorElement>(el, 'a[href="/basket"]');
    expect(text(link)).toBe('View basket');
  });
});
