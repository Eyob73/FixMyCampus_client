import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout';
import { adminGuard } from './guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'tickets',
        loadComponent: () => import('./features/tickets/ticket-list/ticket-list.component').then((m) => m.TicketListComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail.component').then((m) => m.TicketDetailComponent)
      },
      {
        path: 'technicians',
        loadComponent: () => import('./features/technicians/technician-list/technician-list.component').then((m) => m.TechnicianListComponent)
      },
      {
        path: 'reporters',
        loadComponent: () => import('./features/reporters/reporter-list/reporter-list.component').then((m) => m.ReporterListComponent)
      },
      {
        path: 'buildings',
        loadComponent: () => import('./features/buildings/building-list/building-list.component').then((m) => m.BuildingListComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then((m) => m.ReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'admin/dashboard'
  }
];
