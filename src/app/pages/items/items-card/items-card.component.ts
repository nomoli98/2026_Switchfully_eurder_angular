import { Component, computed, input } from '@angular/core';
import { ItemInterface } from '../../../core/interfaces/item.interface';
import { StockUrgencyEnum } from '../../../core/enums/stock-urgency.enum';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  imports: [NgOptimizedImage, CurrencyPipe, RouterLink],
  selector: 'app-items-card',
  templateUrl: './items-card.component.html',
})
export class ItemsCardComponent {
  readonly item = input.required<ItemInterface>();
  protected readonly StockUrgencyEnum = StockUrgencyEnum;

  protected readonly imageSrc = computed(() => this.item().img || '/images/items/item-image.png');
}
