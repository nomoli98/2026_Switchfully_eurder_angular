import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');
  protected readonly label = computed(() => (this.isDark() ? 'Switch to light theme' : 'Switch to dark theme'));

  protected toggle() {
    this.themeService.toggle();
  }
}
