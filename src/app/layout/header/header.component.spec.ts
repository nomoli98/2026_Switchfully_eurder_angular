import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HeaderComponent } from './header.component';
import { BasketService } from '../../core/services/basket/basket.service';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { makeUser } from '../../../testing/fixtures';
import { q, qa, text } from '../../../testing/fixtures';

@Component({ template: '' })
class Dummy {}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: () => ({ matches: false }),
      });
    }
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([
          { path: '', component: Dummy },
          { path: 'items', component: Dummy },
          { path: 'items/new', component: Dummy },
          { path: 'customers', component: Dummy },
          { path: 'basket', component: Dummy },
          { path: 'login', component: Dummy },
        ]),
      ],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  const navLinks = () => qa<HTMLAnchorElement>(el, '.navbar-nav .nav-link');
  const go = async (url: string) => {
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
  };
  const active = () =>
    navLinks()
      .filter((a) => a.classList.contains('active'))
      .map(text);

  it('brand links home', () => {
    expect(q<HTMLAnchorElement>(el, '.navbar-brand').getAttribute('href')).toBe('/');
  });

  it('has plain Home, Items and Customers links (no dropdowns)', () => {
    expect(navLinks().map((a) => [text(a), a.getAttribute('href')])).toEqual([
      ['Home', '/'],
      ['Items', '/items'],
      ['Customers', '/customers'],
    ]);
    expect(el.querySelector('.dropdown-menu, .dropdown-toggle')).toBeNull();
  });

  it('highlights only Home on /', async () => {
    await go('/');
    expect(active()).toEqual(['Home']);
  });

  it('keeps Items highlighted on its sub-pages', async () => {
    await go('/items/new');
    expect(active()).toEqual(['Items']);
    expect(navLinks()[1].getAttribute('aria-current')).toBe('page');
  });

  it('mobile toggler targets the collapsible menu', () => {
    const toggler = q(el, '.navbar-toggler');
    const target = toggler.getAttribute('data-bs-target')!;
    expect(el.querySelector(target)).not.toBeNull();
    expect(toggler.getAttribute('aria-controls')).toBe(target.slice(1));
  });

  it('has a basket button linking to /basket', () => {
    const basket = q<HTMLAnchorElement>(el, 'a[aria-label="Basket"]');
    expect(basket.getAttribute('href')).toBe('/basket');
  });

  it('hides the badge while the basket is empty', () => {
    expect(el.querySelector('[data-testid=basket-badge]')).toBeNull();
  });

  it('shows the number of units in the basket', async () => {
    const basket = TestBed.inject(BasketService);
    basket.addToBasket('a', 2);
    basket.addToBasket('b', 1);
    await fixture.whenStable();
    expect(text(q(el, '[data-testid=basket-badge]'))).toBe('3 items in basket');
  });

  it('highlights the basket button on the basket page', async () => {
    await go('/basket');
    expect(q(el, 'a[aria-label="Basket"]').classList).toContain('active');
  });

  it('theme toggle switches the theme and its label', async () => {
    const theme = TestBed.inject(ThemeService);
    theme.set('light');
    await fixture.whenStable();
    const toggle = q<HTMLButtonElement>(el, '[data-testid=theme-toggle]');
    expect(toggle.getAttribute('aria-label')).toBe('Switch to dark theme');
    toggle.click();
    await fixture.whenStable();
    expect(theme.theme()).toBe('dark');
    expect(toggle.getAttribute('aria-label')).toBe('Switch to light theme');
    expect(text(toggle)).toBe('Light theme');
  });

  it('shows a Log in link when logged out', () => {
    expect(q<HTMLAnchorElement>(el, '[data-testid="login-link"]').getAttribute('href')).toBe('/login');
    expect(el.querySelector('[data-testid="logout"]')).toBeNull();
  });

  it('shows the logged-in customer and logs out', async () => {
    const auth = TestBed.inject(AuthService);
    auth.login(makeUser());
    await fixture.whenStable();
    expect(text(q(el, '[data-testid="header-user"]'))).toBe('Ada Lovelace');
    expect(el.querySelector('[data-testid="login-link"]')).toBeNull();

    q<HTMLButtonElement>(el, '[data-testid="logout"]').click();
    await fixture.whenStable();
    expect(auth.isLoggedIn()).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
