import { Component, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ItemService } from '../../../core/services/item/item.service';

/**
 * Attribute selector: the component IS the <tr>, so the table markup stays valid
 * (tbody > tr > td) and the row doesn't collapse onto one line.
 */
@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'tr[app-basket-table-rows]',
  templateUrl: './basket-table-rows.component.html',
})
export class BasketTableRowsComponent {
  private readonly _itemService = inject(ItemService);
  itemId = input.required<string>();
  productAmount = input.required<number>();
  changedAmount = output<number>();
  removed = output<void>();

  protected readonly item = toSignal(
    toObservable(this.itemId).pipe(switchMap((id) => this._itemService.getOneItem(id))),
  );

  // The basket service is the only place the amount lives: emit, and let productAmount() flow back in
  onChangeAmount(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;

    if (!Number.isInteger(value) || value < 1) {
      // productAmount didn't change, so Angular won't re-render: reset the input by hand
      input.value = String(this.productAmount());
      return;
    }
    if (value !== this.productAmount()) {
      this.changedAmount.emit(value);
    }
  }
}
