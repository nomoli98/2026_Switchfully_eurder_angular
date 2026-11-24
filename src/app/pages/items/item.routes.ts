import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./items.component').then((m) => m.ItemsComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./create-item/create-item.component').then((m) => m.CreateItemComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./display-item/display-item.component').then(
        (m) => m.DisplayItemComponent,
      ),
  },
  {
    path: ':id/update',
    loadComponent: () =>
      import('./update-item/update-item.component').then((m) => m.UpdateItemComponent),
  },
];
