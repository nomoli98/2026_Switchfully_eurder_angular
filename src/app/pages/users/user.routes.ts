import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./users.component').then((m) => m.UsersComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./create-user/create-user.component').then((m) => m.CreateUserComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./display-user/display-user.component').then((m) => m.DisplayUserComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./update-user/update-user.component').then((m) => m.UpdateUserComponent),
  },
];
