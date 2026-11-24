import { DOCUMENT, effect, inject, Service, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'eurder-theme';

/**
 * Light/dark theme using Bootstrap 5.3's built-in colour modes (data-bs-theme on <html>).
 * The choice is saved in localStorage; a first visit follows the OS setting.
 * index.html applies the saved theme before Angular starts, so there is no white flash.
 */
@Service()
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _theme = signal<Theme>(this.initialTheme());

  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      const theme = this._theme();
      this._document.documentElement.setAttribute('data-bs-theme', theme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // storage unavailable (private mode): the theme still works for this visit
      }
    });
  }

  toggle() {
    this._theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  set(theme: Theme) {
    this._theme.set(theme);
  }

  private initialTheme(): Theme {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // ignore
    }
    const prefersDark = this._document.defaultView?.matchMedia?.(
      '(prefers-color-scheme: dark)',
    ).matches;
    return prefersDark ? 'dark' : 'light';
  }
}
