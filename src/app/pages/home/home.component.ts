import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ItemService } from '../../core/services/item/item.service';
import { UserService } from '../../core/services/user/user.service';
import { StockUrgencyEnum } from '../../core/enums/stock-urgency.enum';

const RESTOCK_LIST_SIZE = 5;

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly _itemService = inject(ItemService);
  private readonly _userService = inject(UserService);

  protected readonly items = rxResource({ stream: () => this._itemService.getAllItems() });
  protected readonly users = rxResource({ stream: () => this._userService.getAllUsers() });

  protected readonly loading = computed(() => this.items.isLoading() || this.users.isLoading());
  protected readonly hasError = computed(() => !!this.items.error() || !!this.users.error());

  protected readonly itemCount = computed(() =>
    this.items.hasValue() ? this.items.value().length : null,
  );
  protected readonly customerCount = computed(() =>
    this.users.hasValue() ? this.users.value().length : null,
  );

  protected readonly lowStock = computed(() =>
    this.items.hasValue()
      ? this.items
          .value()
          .filter((i) => i.stockUrgency === StockUrgencyEnum.LOW)
          .sort((a, b) => a.amountOfStock - b.amountOfStock)
      : [],
  );
  protected readonly lowStockCount = computed(() =>
    this.items.hasValue() ? this.lowStock().length : null,
  );
  protected readonly restockList = computed(() => this.lowStock().slice(0, RESTOCK_LIST_SIZE));
}
