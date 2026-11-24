import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BasketService } from '../../core/services/basket/basket.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { EurderService } from '../../core/services/eurder/eurder.service';
import { BasketTableComponent } from './basket-table/basket-table.component';

@Component({
  imports: [RouterLink, BasketTableComponent],
  selector: 'app-basket',
  templateUrl: './basket.component.html',
})
export class BasketComponent {
  private readonly _basketService = inject(BasketService);
  private readonly _eurderService = inject(EurderService);
  private readonly _router = inject(Router);
  protected readonly authService = inject(AuthService);

  protected readonly _basket = this._basketService.basket;

  protected readonly isPlacing = signal(false);
  protected readonly orderPlaced = signal(false);
  protected readonly orderError = signal('');

  protected placeOrder() {
    const user = this.authService.user();
    if (!user) {
      // Guard: ordering needs a customer, come back to the basket after logging in
      this._router.navigate(['/login'], { queryParams: { returnUrl: '/basket' } });
      return;
    }
    const itemGroups = this._basket();
    if (itemGroups.length === 0 || this.isPlacing()) {
      return;
    }

    this.isPlacing.set(true);
    this.orderError.set('');
    this._eurderService.createEurder({ customerId: user.id, itemGroups }).subscribe({
      next: () => {
        this.isPlacing.set(false);
        this._basketService.clear();
        this.orderPlaced.set(true);
      },
      error: () => {
        this.isPlacing.set(false);
        this.orderError.set('Your order could not be placed. Please try again.');
      },
    });
  }

  /** "Okidoki" in the success dialog */
  protected closeDialog() {
    this.orderPlaced.set(false);
    this._router.navigate(['/items']);
  }
}
