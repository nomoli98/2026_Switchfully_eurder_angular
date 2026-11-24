import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { ItemGroupInterface } from '../../../core/interfaces/item-group.interface';
import { BasketService } from '../../../core/services/basket/basket.service';
import { ItemService } from '../../../core/services/item/item.service';
import { BasketTableRowsComponent } from '../basket-table-rows/basket-table-rows.component';

@Component({
  imports: [BasketTableRowsComponent, CurrencyPipe],
  selector: 'app-basket-table',
  templateUrl: './basket-table.component.html',
})
export class BasketTableComponent {
  private readonly _basketService = inject(BasketService);
  private readonly _itemService = inject(ItemService);

  basket = input.required<ItemGroupInterface[]>();

  // Prices for the total (informational only, never sent to the backend)
  private readonly _items = rxResource({ stream: () => this._itemService.getAllItems() });

  private readonly _priceById = computed(
    () => new Map((this._items.hasValue() ? this._items.value() : []).map((i) => [i.id, i.price])),
  );

  protected readonly total = computed(() => {
    if (!this._items.hasValue()) {
      return null;
    }
    const prices = this._priceById();
    return this.basket().reduce((sum, g) => sum + (prices.get(g.itemId) ?? 0) * g.orderedAmount, 0);
  });

  updateAmount(itemId: string, amount: number) {
    this._basketService.updateAmount(itemId, amount);
  }

  remove(itemId: string) {
    this._basketService.removeItem(itemId);
  }
}
