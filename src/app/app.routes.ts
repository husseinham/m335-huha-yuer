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
    component: PermissionsPage,
  },

  {
    path: 'task-list',
    loadComponent: () =>
      import('./pages/task-list/task-list.page').then(m => m.TaskListPage),
  },

  {
    path: 'geo',
    loadComponent: () =>
      import('./pages/geo/geo.page').then(m => m.GeoPage),
  },
  {
    path: 'qr',
    loadComponent: () =>
      import('./pages/qr/qr.page').then(m => m.QrPage),
  },
  {
    path: 'sensor',
    loadComponent: () =>
      import('./pages/sensor/sensor.page').then(m => m.SensorPage),
  },
  {
    path: 'power',
    loadComponent: () =>
      import('./pages/power/power.page').then(m => m.PowerPage),
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
{
  path: 'leaderboard',
  loadComponent: () =>
    import('./pages/leaderboard/leaderboard.page').then(m => m.LeaderboardPage),
},



];
