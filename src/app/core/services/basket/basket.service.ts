import { computed, Service, signal } from '@angular/core';
import { ItemGroupInterface } from '../../interfaces/item-group.interface';

/**
 * The basket lives in a signal, so every component that reads it re-renders when it changes.
 * Always replace the array/objects (never push or mutate), otherwise the signal won't notice.
 */
@Service()
export class BasketService {
  private readonly _basket = signal<ItemGroupInterface[]>([]);

  /** Read-only view for components: change it through the methods below */
  readonly basket = this._basket.asReadonly();

  /** Total number of units, shown in the header badge */
  readonly count = computed(() => this._basket().reduce((sum, g) => sum + g.orderedAmount, 0));

  /** Adds to the existing line if the item is already in the basket */
  addToBasket(itemId: string, orderedAmount = 1) {
    if (!Number.isInteger(orderedAmount) || orderedAmount < 1) {
      return;
    }
    this._basket.update((items) =>
      items.some((i) => i.itemId === itemId)
        ? items.map((i) =>
            i.itemId === itemId ? { ...i, orderedAmount: i.orderedAmount + orderedAmount } : i,
          )
        : [...items, { itemId, orderedAmount }],
    );
  }

  /** Sets the amount of a line; 0 or less removes it */
  updateAmount(itemId: string, orderedAmount: number) {
    if (orderedAmount < 1) {
      this.removeItem(itemId);
      return;
    }
    this._basket.update((items) =>
      items.map((i) => (i.itemId === itemId ? { ...i, orderedAmount } : i)),
    );
  }

  removeItem(itemId: string) {
    this._basket.update((items) => items.filter((i) => i.itemId !== itemId));
  }

  clear() {
    this._basket.set([]);
  }
}
