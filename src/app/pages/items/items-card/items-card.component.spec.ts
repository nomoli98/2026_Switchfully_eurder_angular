import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ItemsCardComponent } from './items-card.component';
import { makeItem, q, text } from '../../../../testing/fixtures';
import { StockUrgencyEnum } from '../../../core/enums/stock-urgency.enum';
import { ItemInterface } from '../../../core/interfaces/item.interface';

describe('ItemsCardComponent', () => {
  let fixture: ComponentFixture<ItemsCardComponent>;
  let el: HTMLElement;

  async function setup(item: ItemInterface) {
    TestBed.configureTestingModule({
      imports: [ItemsCardComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(ItemsCardComponent);
    fixture.componentRef.setInput('item', item);
    await fixture.whenStable();
    el = fixture.nativeElement;
  }

  it('shows name, price in euro and stock urgency', async () => {
    await setup(makeItem({ name: 'mug', price: 12.5 }));
    expect(text(q(el, '.card-header'))).toBe('mug');
    expect(text(q(el, '.card-body'))).toContain('€12.50');
    expect(text(q(el, '.card-body'))).toContain('high');
  });

  it.each([
    [StockUrgencyEnum.HIGH, 'text-bg-success'],
    [StockUrgencyEnum.MEDIUM, 'text-bg-warning'],
    [StockUrgencyEnum.LOW, 'text-bg-danger'],
  ])('colours %s stock with %s', async (urgency, cls) => {
    await setup(makeItem({ stockUrgency: urgency }));
    const card = q(el, '.card');
    expect(card.classList).toContain(cls);
    for (const other of ['text-bg-success', 'text-bg-warning', 'text-bg-danger'].filter(
      (c) => c !== cls,
    )) {
      expect(card.classList).not.toContain(other);
    }
  });

  it('uses the placeholder image when the item has none', async () => {
    await setup(makeItem({ img: '' }));
    expect(q<HTMLImageElement>(el, 'img').getAttribute('src')).toBe('/images/items/item-image.png');
  });

  it('uses the item image when there is one', async () => {
    await setup(makeItem({ img: '/images/x.png' }));
    expect(q<HTMLImageElement>(el, 'img').getAttribute('src')).toBe('/images/x.png');
  });

  it('uses the name as alt text', async () => {
    await setup(makeItem({ name: 'mug' }));
    expect(q<HTMLImageElement>(el, 'img').alt).toBe('mug');
  });

  it('links to the detail page', async () => {
    await setup(makeItem({ id: 'abc' }));
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    q(el, '.card').click();
    expect(String(spy.mock.calls[0][0])).toBe('/items/abc');
  });
});
