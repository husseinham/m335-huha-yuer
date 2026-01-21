import { Routes } from '@angular/router';
import { PermissionsPage } from './pages/permissions/permissions.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full',
  },
  {
    path: 'start',
    loadComponent: () =>
      import('./pages/start/start.page').then(m => m.StartPage),
  },
  {
    path: 'permissions',
    component: PermissionsPage
  },

];