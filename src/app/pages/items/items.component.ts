import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ItemsCardComponent } from './items-card/items-card.component';
import { ItemService } from '../../core/services/item/item.service';

const PAGE_SIZE = 8;

@Component({
  imports: [ItemsCardComponent, RouterLink],
  selector: 'app-items',
  templateUrl: './items.component.html',
})
export class ItemsComponent {
  private readonly _itemService = inject(ItemService);

  private readonly _items = toSignal(this._itemService.getAllItems(), {
    initialValue: [],
  });

  protected readonly _search = signal('');

  protected readonly _filteredItems = computed(() => {
    const term = this._search().trim().toLowerCase();
    return term ? this._items().filter((i) => i.name.toLowerCase().includes(term)) : this._items();
  });

  // Resets to page 1 whenever the search term changes
  protected readonly _page = linkedSignal({
    source: this._search,
    computation: () => 1,
  });

  protected readonly _totalPages = computed(() =>
    Math.max(1, Math.ceil(this._filteredItems().length / PAGE_SIZE)),
  );

  protected readonly _pages = computed(() =>
    Array.from({ length: this._totalPages() }, (_, i) => i + 1),
  );

  protected readonly _pagedItems = computed(() => {
    const start = (this._page() - 1) * PAGE_SIZE;
    return this._filteredItems().slice(start, start + PAGE_SIZE);
  });

  protected goTo(page: number) {
    if (page >= 1 && page <= this._totalPages()) {
      this._page.set(page);
    }
  }
}
