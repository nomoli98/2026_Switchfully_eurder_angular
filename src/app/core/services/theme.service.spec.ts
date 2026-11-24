import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  const html = document.documentElement;

  function create(prefersDark = false) {
    // jsdom has no matchMedia; the service reads it via document.defaultView
    (window as any).matchMedia = (q: string) => ({ matches: prefersDark && q.includes('dark') });
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);
    TestBed.tick(); // run the effect
    return service;
  }

  beforeEach(() => {
    localStorage.clear();
    html.removeAttribute('data-bs-theme');
  });

  afterEach(() => {
    delete (window as any).matchMedia;
  });

  it('defaults to light when nothing is saved and the OS has no dark preference', () => {
    const service = create(false);
    expect(service.theme()).toBe('light');
    expect(html.getAttribute('data-bs-theme')).toBe('light');
  });

  it('follows the OS dark preference when nothing is saved', () => {
    expect(create(true).theme()).toBe('dark');
  });

  it('uses the saved theme over the OS preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(create(true).theme()).toBe('light');
  });

  it('ignores an invalid saved value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(create(false).theme()).toBe('light');
  });

  it('toggle switches between light and dark, updates <html> and saves the choice', () => {
    const service = create(false);

    service.toggle();
    TestBed.tick();
    expect(service.theme()).toBe('dark');
    expect(html.getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    service.toggle();
    TestBed.tick();
    expect(service.theme()).toBe('light');
    expect(html.getAttribute('data-bs-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('keeps working when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const service = create(false);
    service.toggle();
    expect(() => TestBed.tick()).not.toThrow();
    expect(html.getAttribute('data-bs-theme')).toBe('dark');
    vi.restoreAllMocks();
  });
});
