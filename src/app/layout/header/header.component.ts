import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BasketService } from '../../core/services/basket/basket.service';
import { ThemeService } from '../../core/services/theme/theme.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
  private readonly _basketService = inject(BasketService);

  protected readonly basketCount = this._basketService.count;
}
