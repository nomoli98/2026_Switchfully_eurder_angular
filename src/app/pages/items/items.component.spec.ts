import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ItemsComponent } from './items.component';
import { ItemService } from '../../core/services/item/item.service';
import { makeItem, q, qa, text, typeInto } from '../../../testing/fixtures';

describe('ItemsComponent', () => {
  let fixture: ComponentFixture<ItemsComponent>;
  let el: HTMLElement;

  async function setup(count: number, names?: string[]) {
    const items = (names ?? Array.from({ length: count }, (_, i) => `item ${i + 1}`)).map(
      (name, i) => makeItem({ id: `id-${i + 1}`, name }),
    );
    TestBed.configureTestingModule({
      imports: [ItemsComponent],
      providers: [
        provideRouter([]),
        { provide: ItemService, useValue: { getAllItems: () => of(items) } },
      ],
    });
    fixture = TestBed.createComponent(ItemsComponent);
    await fixture.whenStable();
    el = fixture.nativeElement;
  }

  const cardNames = () => qa(el, 'app-items-card .card-header').map(text);
  const search = async (term: string) => {
    typeInto(q<HTMLInputElement>(el, 'input[type=search]'), term);
    await fixture.whenStable();
  };
  const pageButtons = () => qa<HTMLButtonElement>(el, '.pagination .page-link');

  it('shows a card per item', async () => {
    await setup(3);
    expect(cardNames()).toEqual(['item 1', 'item 2', 'item 3']);
  });

  it('has an Add Item button linking to the create page', async () => {
    await setup(1);
    const add = q<HTMLAnchorElement>(el, 'a.btn-success');
    expect(text(add)).toBe('Add Item');
    expect(add.getAttribute('href')).toBe('/items/new');
  });

  it('filters by name, case-insensitive', async () => {
    await setup(0, ['Mug', 'Plate', 'mug holder']);
    await search('MUG');
    expect(cardNames()).toEqual(['Mug', 'mug holder']);
  });

  it('ignores surrounding spaces in the search', async () => {
    await setup(0, ['Mug', 'Plate']);
    await search('  plate ');
    expect(cardNames()).toEqual(['Plate']);
  });

  it('shows a message when nothing matches', async () => {
    await setup(0, ['Mug']);
    await search('zzz');
    expect(text(el.querySelector('.card-group p'))).toBe('No items match "zzz".');
  });

  it('does not paginate 8 items or fewer', async () => {
    await setup(8);
    expect(cardNames()).toHaveLength(8);
    expect(el.querySelector('.pagination')).toBeNull();
  });

  it('shows 8 items per page', async () => {
    await setup(19);
    expect(cardNames()).toHaveLength(8);
    expect(pageButtons().map(text)).toEqual(['Previous', '1', '2', '3', 'Next']);
  });

  it('moves between pages', async () => {
    await setup(19);
    pageButtons()
      .find((b) => text(b) === '3')!
      .click();
    await fixture.whenStable();
    expect(cardNames()).toEqual(['item 17', 'item 18', 'item 19']);
    pageButtons()
      .find((b) => text(b) === 'Previous')!
      .click();
    await fixture.whenStable();
    expect(cardNames()[0]).toBe('item 9');
  });

  it('disables Previous on the first page and Next on the last', async () => {
    await setup(9);
    const items = () => qa(el, '.pagination .page-item');
    expect(items()[0].classList).toContain('disabled');
    pageButtons()
      .find((b) => text(b) === 'Next')!
      .click();
    await fixture.whenStable();
    expect(items().at(-1)!.classList).toContain('disabled');
    pageButtons()
      .find((b) => text(b) === 'Next')!
      .click();
    await fixture.whenStable();
    expect(cardNames()).toEqual(['item 9']);
  });

  it('goes back to page 1 when the search changes', async () => {
    await setup(19);
    pageButtons()
      .find((b) => text(b) === '2')!
      .click();
    await fixture.whenStable();
    await search('item');
    expect(q(el, '.page-item.active').textContent?.trim()).toBe('1');
  });
});
