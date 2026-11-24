import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import { disabled, form, FormField, maxLength, min, required } from '@angular/forms/signals';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ItemInterface } from '../../../core/interfaces/item.interface';
import { StockUrgencyEnum } from '../../../core/enums/stock-urgency.enum';

export interface Product {
  name: string;
  description: string;
  price: number;
  stock: number;
}

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-form-item',
  templateUrl: './form-item.component.html',
})
export class FormItemComponent {
  editable = input.required<boolean>();
  method = input<(item: ItemInterface) => Observable<unknown>>();
  methodName = input<'update' | 'create'>();
  item = input<ItemInterface>();

  private readonly initial: ItemInterface = {
    id: '',
    name: '',
    description: '',
    img: '',
    price: 0,
    amountOfStock: 0,
    stockUrgency: StockUrgencyEnum.HIGH,
  };

  product = linkedSignal<ItemInterface>(() => {
    const item = this.item();
    return item ? { ...item } : { ...this.initial };
  });

  textCount = computed(() => this.product().description.length);
  descTooLong = computed(() => this.textCount() >= 255);

  isLoading = signal(false);

  form = form(this.product, (p) => {
    disabled(p, () => !this.editable());
    required(p.name, { message: 'Please enter a name.' });
    required(p.description, { message: 'Please enter a description.' });
    maxLength(p.description, 255, { message: 'Description cannot be longer than 255 characters' });
    min(p.price, 0, { message: "Price can't be negative." });
    min(p.amountOfStock, 0, { message: "Stock can't be negative." });
  });

  onSubmit(event: Event) {
    event.preventDefault();

    const saveProduct = this.method();
    if (!saveProduct || this.form().invalid()) {
      return;
    }

    this.isLoading.set(true);
    saveProduct(this.product()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.resetErrors();
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  protected resetErrors() {
    this.product.set({ ...this.initial });
    this.form().reset();
  }
}
