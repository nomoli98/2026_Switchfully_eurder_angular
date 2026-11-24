import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'items',
    loadChildren: () => import('./pages/items/item.routes').then((r) => r.routes),
  },
  {
    path: 'customers',
    loadChildren: () => import('./pages/users/user.routes').then((r) => r.routes),
  },
  {
    path: 'basket',
    loadComponent: () => import('./pages/basket/basket.component').then((m) => m.BasketComponent),
  },
];
