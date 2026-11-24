import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { HomeComponent } from './pages/home/home.component';
import { BasketComponent } from './pages/basket/basket.component';
import { routes as itemRoutes } from './pages/items/item.routes';
import { routes as userRoutes } from './pages/users/user.routes';

describe('App', () => {
  beforeEach(() => {
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: () => ({ matches: false }),
      });
    }
  });

  it('renders header, router outlet and footer', async () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-header')).not.toBeNull();
    expect(el.querySelector('router-outlet')).not.toBeNull();
    expect(el.querySelector('app-footer')).not.toBeNull();
  });
});

describe('app routes', () => {
  const find = (path: string) => routes.find((r) => r.path === path)!;

  it('"" (exact) loads the home page', async () => {
    expect(find('').pathMatch).toBe('full');
    expect(await (find('').loadComponent as () => Promise<unknown>)()).toBe(HomeComponent);
  });

  it('"basket" loads the basket page', async () => {
    expect(await (find('basket').loadComponent as () => Promise<unknown>)()).toBe(BasketComponent);
  });

  it('"items" and "customers" load their child routes', async () => {
    expect(await (find('items').loadChildren as () => Promise<unknown>)()).toBe(itemRoutes);
    expect(await (find('customers').loadChildren as () => Promise<unknown>)()).toBe(userRoutes);
  });
});
