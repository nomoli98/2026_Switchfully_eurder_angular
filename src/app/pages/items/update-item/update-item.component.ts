import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { FormItemComponent } from '../../forms/form-item/form-item.component';
import { ItemService } from '../../../core/services/item.service';
import { ItemInterface } from '../../../core/interfaces/item.interface';

@Component({
  imports: [FormItemComponent],
  selector: 'app-update-item',
  templateUrl: './update-item.component.html',
})
export class UpdateItemComponent {
  private readonly itemService = inject(ItemService);
  private readonly router = inject(Router);

  // Filled from the route param :id
  readonly id = input.required<string>();

  protected readonly item = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.itemService.getOneItem(id),
  });

  protected readonly updateItem = (item: ItemInterface) =>
    this.itemService
      .updateItem(this.id(), item)
      .pipe(tap(() => this.router.navigate(['/item', this.id()])));
}
