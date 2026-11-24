import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormItemComponent } from '../../forms/form-item/form-item.component';
import { ItemService } from '../../../core/services/item/item.service';
import { BasketService } from '../../../core/services/basket/basket.service';

@Component({
  imports: [FormItemComponent, RouterLink],
  selector: 'app-display-item',
  templateUrl: './display-item.component.html',
})
export class DisplayItemComponent {
  private readonly _itemService = inject(ItemService);
  private readonly _basketService = inject(BasketService);
  readonly id = input.required<string>();

  protected readonly item = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this._itemService.getOneItem(id))),
  );

  protected readonly amount = signal(1);
  protected readonly confirmation = signal('');

  protected onAmountInput(event: Event) {
    this.amount.set((event.target as HTMLInputElement).valueAsNumber);
  }

  protected addToBasket() {
    const item = this.item();
    const amount = this.amount();
    if (!item || !Number.isInteger(amount) || amount < 1) {
      return;
    }
    this._basketService.addToBasket(item.id, amount);
    this.confirmation.set(`Added ${amount} × ${item.name} to your basket.`);
    this.amount.set(1);
  }
}
