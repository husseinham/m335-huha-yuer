import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'start', pathMatch: 'full' },

  {
    path: 'start',
    loadComponent: () =>
      import('./pages/start/start.page').then(m => m.StartPage),
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
];
