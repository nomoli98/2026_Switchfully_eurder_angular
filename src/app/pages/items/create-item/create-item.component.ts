import { Component, inject } from '@angular/core';
import { FormItemComponent } from '../../forms/form-item/form-item.component';
import { ItemInterface } from '../../../core/interfaces/item.interface';
import { ItemService } from '../../../core/services/item.service';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  imports: [FormItemComponent],
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
})
export class CreateItemComponent {
  private readonly itemService = inject(ItemService);

  private readonly router = inject(Router);

  protected readonly createItem = (item: ItemInterface) =>
    this.itemService.createItem(item).pipe(tap(() => this.router.navigate(['/items'])));
}
