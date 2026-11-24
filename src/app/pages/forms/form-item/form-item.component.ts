import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { disabled, form, FormField, maxLength, min, required } from '@angular/forms/signals';
import { Observable } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { ItemInterface } from '../../../core/interfaces/item.interface';
import { StockUrgencyEnum } from '../../../core/enums/stock-urgency.enum';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-form-item',
  templateUrl: './form-item.component.html',
})
export class FormItemComponent {
  editable = input.required<boolean>();
  method = input<(item: ItemInterface) => Observable<ItemInterface>>();
  methodName = input<'update' | 'create'>();
  item = input<ItemInterface>();

  private readonly router = inject(Router);

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
      next: (saved) => {
        this.isLoading.set(false);
        this.resetErrors();
        // create: saved.id is the new item's id; update: same id as before
        const id = saved?.id || this.item()?.id;
        this.router.navigate(id ? ['/items', id] : ['/items']);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  protected cancel() {
    this.resetErrors();
    const id = this.item()?.id;
    this.router.navigate(this.methodName() === 'update' && id ? ['/items', id] : ['/items']);
  }

  protected resetErrors() {
    this.product.set({ ...this.initial });
    this.form().reset();
  }
}
