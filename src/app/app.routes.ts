import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  // {
  //   path: 'welcome',
  //   loadChildren: () => import('./pages/welcome/welcome.routes').then((m) => m.WELCOME_ROUTES),
  // },
  { path: '', redirectTo: 'report', pathMatch: 'full' },
  {
    path: 'report',
    loadComponent: () => import('./pages/report-issue/report-issue').then((m) => m.ReportIssue),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  { path: '**', redirectTo: 'report' },
];
