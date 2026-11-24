import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

function mockPrefersDark(dark: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({ matches: dark && query.includes('dark'), media: query }) as MediaQueryList,
  );
}

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-bs-theme');
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: () => ({ matches: false }),
      });
    }
  });

  afterEach(() => vi.restoreAllMocks());

  function create() {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    return service;
  }

  it('defaults to light when the OS has no dark preference', () => {
    mockPrefersDark(false);
    expect(create().theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('follows the OS dark preference on a first visit', () => {
    mockPrefersDark(true);
    expect(create().theme()).toBe('dark');
  });

  it('a saved choice wins over the OS preference', () => {
    mockPrefersDark(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(create().theme()).toBe('light');
  });

  it('ignores a garbage saved value', () => {
    mockPrefersDark(false);
    localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(create().theme()).toBe('light');
  });

  it('toggle switches the theme, sets data-bs-theme and saves it', () => {
    mockPrefersDark(false);
    const service = create();
    service.toggle();
    TestBed.tick();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    service.toggle();
    TestBed.tick();
    expect(service.theme()).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('set applies a theme directly', () => {
    mockPrefersDark(false);
    const service = create();
    service.set('dark');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });
});
