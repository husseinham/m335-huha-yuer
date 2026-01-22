import { Routes } from '@angular/router';
import { PermissionsPage } from './pages/permissions/permissions.page';

export const routes: Routes = [
  { path: '', redirectTo: 'start', pathMatch: 'full' },

  {
    path: 'start',
    loadComponent: () =>
      import('./pages/start/start.page').then(m => m.StartPage),
  },

  {
    path: 'permissions',
    component: PermissionsPage
  },

  {
    path: 'task-list',
    loadComponent: () =>
      import('./pages/task-list/task-list.page').then(m => m.TaskListPage),
  },

  {
    path: 'task/:key',
    loadComponent: () =>
      import('./pages/task/task.page').then(m => m.TaskPage),
  },
  {
    path: 'geo',
    loadComponent: () => import('./pages/geo/geo.page').then( m => m.GeoPage)
  },
{
  path: 'task/geo',
  loadComponent: () =>
    import('./pages/geo/geo.page').then(m => m.GeoPage),
},
  {
    path: 'finish',
    loadComponent: () => import('./pages/finish/finish.page').then( m => m.FinishPage)
  },

{
  path: 'finish',
  loadComponent: () =>
    import('./pages/finish/finish.page').then(m => m.FinishPage),
},

];

