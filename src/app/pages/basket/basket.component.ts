import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BasketService } from '../../core/services/basket/basket.service';
import { BasketTableComponent } from './basket-table/basket-table.component';

@Component({
  imports: [RouterLink, BasketTableComponent],
  selector: 'app-basket',
  templateUrl: './basket.component.html',
})
export class BasketComponent {
  private readonly _basketService = inject(BasketService);

  protected readonly _basket = this._basketService.basket;
}
