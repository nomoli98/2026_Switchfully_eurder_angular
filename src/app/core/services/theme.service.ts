import { DOCUMENT, effect, inject, Service, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'eurder-theme';

/**
 * Light/dark theme using Bootstrap 5.3 colour modes (`data-bs-theme` on <html>).
 * The choice is saved in localStorage; without a saved choice the OS preference is used.
 * index.html applies the saved theme before Angular starts, so there is no flash on reload.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>(this.initialTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.setAttribute('data-bs-theme', theme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // storage can be unavailable (private mode, blocked cookies) – the theme still works for this visit
      }
    });
  }

  toggle() {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  private initialTheme(): Theme {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore, fall back to the OS preference
    }
    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
