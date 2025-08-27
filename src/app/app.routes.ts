import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Error404Component } from './pages/error404/error404.component';  // <-- importa aquí

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
   {
    path: 'index',
    loadComponent: () =>
      import('./pages/index/index.component').then(m => m.IndexComponent),
    canActivate: [authGuard]
  },
    {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'task',
    loadChildren: () => import('./pages/tasks/tasks.routes').then(m => m.TASK_ROUTES),
    canActivate: [authGuard]
  },
 
    
  { path: '**', component: Error404Component }
];
