import { Component, inject } from '@angular/core';
import { FormItemComponent } from '../../forms/form-item/form-item.component';
import { ItemInterface } from '../../../core/interfaces/item.interface';
import { ItemService } from '../../../core/services/item/item.service';

@Component({
  imports: [FormItemComponent],
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
})
export class CreateItemComponent {
  private readonly itemService = inject(ItemService);

  // Navigation after saving is handled by the form
  protected readonly createItem = (item: ItemInterface) => this.itemService.createItem(item);
}
