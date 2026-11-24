import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BasketService } from '../../core/services/basket/basket.service';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  private readonly _basketService = inject(BasketService);
  private readonly _router = inject(Router);

  protected readonly basketCount = this._basketService.count;

  protected logout() {
    this.authService.logout();
    this._router.navigateByUrl('/');
  }
}
