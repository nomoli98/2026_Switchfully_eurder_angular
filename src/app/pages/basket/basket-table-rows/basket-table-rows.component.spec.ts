import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { BasketTableRowsComponent } from './basket-table-rows.component';
import { ItemService } from '../../../core/services/item/item.service';
import { makeItem, q, qa, text, typeInto } from '../../../../testing/fixtures';

@Component({
  imports: [BasketTableRowsComponent],
  template: ` <table>
    <tbody>
      <tr
        app-basket-table-rows
        [itemId]="'a'"
        [productAmount]="amount()"
        (changedAmount)="changed.push($event)"
        (removed)="removed = removed + 1"
      ></tr>
    </tbody>
  </table>`,
})
class HostComponent {
  amount = signal(2);
  changed: number[] = [];
  removed = 0;
}

describe('BasketTableRowsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let el: HTMLElement;
  const getOneItem = vi.fn();

  async function setup(item$ = of(makeItem({ id: 'a', name: 'mug', price: 4.25 }))) {
    getOneItem.mockReturnValue(item$);
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([]), { provide: ItemService, useValue: { getOneItem } }],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
    el = fixture.nativeElement;
  }

  const amountInput = () => q<HTMLInputElement>(el, 'input');

  it('loads the item by id', async () => {
    await setup();
    expect(getOneItem).toHaveBeenCalledWith('a');
  });

  it('is the <tr> itself, with 4 cells', async () => {
    await setup();
    const tr = q(el, 'tbody > tr');
    expect(tr.hasAttribute('app-basket-table-rows')).toBe(true);
    expect(qa(tr, ':scope > td')).toHaveLength(4);
  });

  it('shows name (linking to the item), amount and line total', async () => {
    await setup();
    const cells = qa(el, 'td');
    expect(text(cells[0])).toBe('mug');
    expect(q<HTMLAnchorElement>(cells[0], 'a').getAttribute('href')).toBe('/items/a');
    expect(amountInput().value).toBe('2');
    expect(text(cells[2])).toBe('€8.50');
  });

  it('follows the amount input from the parent', async () => {
    await setup();
    host.amount.set(5);
    await fixture.whenStable();
    expect(amountInput().value).toBe('5');
    expect(text(qa(el, 'td')[2])).toBe('€21.25');
  });

  it('emits a valid new amount', async () => {
    await setup();
    typeInto(amountInput(), '3');
    expect(host.changed).toEqual([3]);
  });

  it('does not emit when the amount did not change', async () => {
    await setup();
    typeInto(amountInput(), '2');
    expect(host.changed).toEqual([]);
  });

  it.each(['0', '-1', '1.5', ''])('rejects "%s" and puts the old amount back', async (value) => {
    await setup();
    typeInto(amountInput(), value);
    expect(host.changed).toEqual([]);
    expect(amountInput().value).toBe('2');
  });

  it('emits removed when Remove is clicked', async () => {
    await setup();
    const remove = q<HTMLButtonElement>(el, 'button');
    expect(remove.getAttribute('aria-label')).toBe('Remove mug');
    remove.click();
    expect(host.removed).toBe(1);
  });

  it('shows a placeholder cell while the item loads', async () => {
    await setup(NEVER as any);
    expect(qa(el, 'td')).toHaveLength(1);
    expect(q(el, 'td').getAttribute('colspan')).toBe('4');
  });
});
