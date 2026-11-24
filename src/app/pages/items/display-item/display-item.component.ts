import { Component, inject, input } from '@angular/core';
import { FormItemComponent } from '../../forms/form-item/form-item.component';

import { ItemService } from '../../../core/services/item.service';
import { switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [FormItemComponent],
  selector: 'app-display-item',
  templateUrl: './display-item.component.html',
})
export class DisplayItemComponent {
  private readonly _itemService = inject(ItemService);
  readonly id = input.required<string>();

  protected readonly item = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this._itemService.getOneItem(id))),
  );
}
