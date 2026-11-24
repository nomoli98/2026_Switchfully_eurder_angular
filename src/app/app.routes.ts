import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'items',
    loadChildren: () => import('./pages/items/item.routes').then((r) => r.routes),
  },
  {
    path: 'customers',
    loadChildren: () => import('./pages/users/user.routes').then((r) => r.routes),
  },
];
